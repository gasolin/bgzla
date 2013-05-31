/**
 *
 * Author: Fred Lin (gasolin@mozilla.com)
 * Mozilla License
 *
 */
'use strict';

var GAIA = {
  lastest: moment().day(-7),
  hot_bugs: [],
  my_email: '',
  bugzilla: null,
  params: {
        'username': 'autonome+bztest@gmail.com',
        'password': 'bztest1A',
        'bug_status': ['NEW', 'UNCONFIRMED', 'ASSIGNED', 'REOPENED', 'READY'],
        'field0-0-0': 'cf_blocking_b2g',
        'type0-0-0': 'contains',
        'field1-0-0': 'whiteboard',
        'type1-0-0': 'not_contains',
        'value1-0-0': 'npotb',
        'component': ['Gaia', 'Gaia::Bluetooth File Transfer', 'Gaia::Browser',
                      'Gaia::Calculator', 'Gaia::Camera', 'Gaia::Clock',
                      'Gaia::Contacts', 'Gaia::Cost Control', 'Gaia::Dialer',
                      'Gaia::E-Mail', 'Gaia::Everything.me',
                      'Gaia::First Time Experience', 'Gaia::FMRadio',
                      'Gaia::Gallery', 'Gaia::Homescreen',
                      'Gaia::Keyboard', 'Gaia::Music', 'Gaia::PDF Viewer',
                      'Gaia::Settings', 'Gaia::SMS', 'Gaia::System::Lockscreen',
                      'Gaia::Video', 'General'
                     ],
        'product': 'Boot2Gecko'
  },
  tef_params: null,
  leo_params: null,
  mine_params: null
};

var bgzla = {
  // init
  init: function init() {
    $('#mine_panel').hide();
    $('#hot_panel').hide();

    GAIA.bugzilla = bz.createClient();

    var that = this;

    asyncStorage.getItem('my_email', function(value) {
      GAIA.my_email = value;
      // var mine_bugs;
      GAIA.mine_params = JSON.parse(JSON.stringify(GAIA.params));
      delete GAIA.mine_params['value0-0-0'];
      delete GAIA.mine_params['component'];
      if (GAIA.my_email !== null) {
        that.emit_myid_change();
      }
    });
    // var my_password = localStorage.my_password || null;

    $('#my_id').click(this.input_bugzilla_id.bind(this));

    $('#mine_cnt').bind('touchstart mousedown', function(event) {
      that.toggle_panel(event, '#mine_panel');
    });

    $('#tef_cnt').bind('touchstart mousedown', function(event) {
      that.toggle_panel(event, '#tef_panel');
    });

    $('#leo_cnt').bind('touchstart mousedown', function(event) {
      that.toggle_panel(event, '#leo_panel');
    });

    $('#hot_cnt').bind('touchstart mousedown', function(event) {
      that.toggle_panel(event, '#hot_panel');
    });

    $('#reload').click(function() {
      location.reload();
    });

    // var tef_bugs;
    GAIA.tef_params = JSON.parse(JSON.stringify(GAIA.params));
    GAIA.tef_params['value0-0-0'] = 'tef+';
    // blockers: tef+, not npotb
    GAIA.bugzilla.searchBugs(GAIA.tef_params, function(error, bugs) {
      that.bug_handler_tef(error, bugs);
    });

    // var leo_bugs;
    GAIA.leo_params = JSON.parse(JSON.stringify(GAIA.params));
    GAIA.leo_params['value0-0-0'] = 'leo+';
    // blockers: leo+, not npotb
    GAIA.bugzilla.searchBugs(GAIA.leo_params, function(error, bugs) {
      that.bug_handler_leo(error, bugs);
    });
  },

  // generate the item
  format_bug: function format_bug(bug) {
    var HOT_FLAG = false;
    // find hot bugs
    var create_time = moment(bug.creation_time);
    if (create_time.isAfter(GAIA.lastest)) {
      HOT_FLAG = true;
    }

    // check if has assignee
    var assignee = ' (' + bug.assigned_to.name + ')';
    if (bug.assigned_to.name === 'nobody@mozilla.org') {
      assignee = '';
    }
    var item = '<li id="bug_' + bug.id + '">';
    if (HOT_FLAG) {
      item += '<i class="icon-rocket"></i> ';
    }
    item += '[<a href="http://bugzil.la/' + bug.id + '" target="_blank">' +
            bug.id + '</a>] ';
    if (assignee !== '') {
      item += bug.summary + assignee;
    } else {
      item += '<em>' + bug.summary + '</em>';
    }

    // show hot bug date
    if (HOT_FLAG) {
      item += ' (' + create_time.format('MM/DD') + ')';
    }
    item += '</li>\n';
    return item;
  },

  emit_myid_change: function emit_myid_change() {
      // console.log('fetch ' + my_email + '/' + my_password);

      // use personal auth
      // if (my_email!==null && my_password!==null) {
      //   mine_params['username'] = my_email;
      //   mine_params['password'] = my_password;
      // }
      GAIA.mine_params['email1'] = GAIA.my_email;
      GAIA.mine_params['email1_assigned_to'] = 1;
      var that = this;
      GAIA.bugzilla.searchBugs(GAIA.mine_params, function(error, bugs) {
        if (!error) {
          // console.log(bugs);
          // mine_bugs = bugs;
          var outcome = '<ul>';
          for (var i = 0; i < bugs.length; i++) {
            outcome += that.format_bug(bugs[i]);
          }
          outcome += '</ul>';
          $('#mine_panel').html(outcome);
          $('#mine_cnt').text(bugs.length);
        }
      });
  },

  emit_hot_cnt_change: function emit_hot_cnt_change() {
      var outcome = '<ul>';
      for (var i = 0; i < GAIA.hot_bugs.length; i++) {
        outcome += this.format_bug(GAIA.hot_bugs[i]);
      }
      outcome += '</ul>';
      $('#hot_panel').html(outcome);
      $('#hot_cnt').text(GAIA.hot_bugs.length);
  },

  input_bugzilla_id: function input_bugzilla_id() {
      GAIA.my_email = prompt('Enter your bugzilla email' +
                        '(only stored in this browser):');
      // my_password = prompt('Enter your password can show secret bugs:');
      if (GAIA.my_email !== '') {
        console.log('default account changed to ' + GAIA.my_email);
        asyncStorage.setItem('my_email', GAIA.my_email);
        // localStorage.my_password = my_password;
        this.emit_myid_change();
      } else {
        alert('account not changed');
      }
  },

  toggle_panel: function toggle_panel(event, panel_id) {
    event.stopPropagation();
    event.preventDefault();
    if (event.handled !== true) {
      $(panel_id).toggle();
      event.handled = true;
    } else {
      return false;
    }
  },

  bug_handler_tef: function bug_handler_tef(error, bugs) {
    if (!error) {
      // tef_bugs = bugs;
      $('#tef_panel').hide();
      // console.log(bugs);
      var nobody_cnt = 0;
      var outcome = '<ul>';
      for (var i = 0; i < bugs.length; i++) {

        if (moment(bugs[i].creation_time).isAfter(GAIA.lastest)) {
          GAIA.hot_bugs.push(bugs[i]);
        }

        if (bugs[i].assigned_to.name === 'nobody@mozilla.org') {
          nobody_cnt += 1;
        }
        outcome += this.format_bug(bugs[i]);
      }
      outcome += '</ul>';
      $('#tef_panel').html(outcome);
      $('#tef_cnt').text(bugs.length);
      $('#tef_nobody_cnt').text('not assigned: ' + nobody_cnt);
      this.emit_hot_cnt_change();
    }
  },

  bug_handler_leo: function bug_handler_leo(error, bugs) {
    if (!error) {
      // leo_bugs = bugs;
      $('#leo_panel').hide();
      // console.log(bugs);
      var nobody_cnt = 0;
      var outcome = '<ul>';
      for (var i = 0; i < bugs.length; i++) {

        if (moment(bugs[i].creation_time).isAfter(GAIA.lastest)) {
          GAIA.hot_bugs.push(bugs[i]);
        }

        if (bugs[i].assigned_to.name === 'nobody@mozilla.org') {
          nobody_cnt += 1;
        }
        outcome += this.format_bug(bugs[i]);
      }
      outcome += '</ul>';
      $('#leo_panel').html(outcome);
      $('#leo_cnt').text(bugs.length);
      $('#leo_nobody_cnt').text('not assigned: ' + nobody_cnt);
      this.emit_hot_cnt_change();
    }
  }

};

window.addEventListener('load', function browserOnLoad(evt) {
  window.removeEventListener('load', browserOnLoad);
  bgzla.init();
});
