/**
 *
 * Author: Fred Lin (gasolin@mozilla.com)
 * Mozilla License
 *
 */
'use strict';

// get this week
var now = moment();
var lastest = this.now.day(-7);
var hot_bugs = [];
var mine_params;
var my_email;
var bugzilla;

var bgzla = {
  params: {
        'username': 'autonome+bztest@gmail.com',
        'password': 'bztest1A',
        'bug_status': ['NEW', 'UNCONFIRMED', 'ASSIGNED', 'REOPENED', 'READY'],
        'field0-0-0': 'cf_blocking_b2g',
        'type0-0-0': 'contains',
        'value0-0-0': 'tef+',
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

  // init
  init: function init() {
    $('#mine_panel').hide();
    $('#hot_panel').hide();

    bugzilla = bz.createClient();
    my_email = localStorage.my_email || null;
    // var my_password = localStorage.my_password || null;
    var that = this;
    $('#my_id').click(this.input_bugzilla_id.bind(this));

    $('#mine_cnt').bind('touchstart mousedown', function(event) {
      event.stopPropagation();
      event.preventDefault();
      if (event.handled !== true) {
        $('#mine_panel').toggle();
        event.handled = true;
      } else {
        return false;
      }
    });

    $('#tef_cnt').bind('touchstart mousedown', function(event) {
      event.stopPropagation();
      event.preventDefault();
      if (event.handled !== true) {
        $('#tef_panel').toggle();
        event.handled = true;
      } else {
        return false;
      }
    });

    $('#leo_cnt').bind('touchstart mousedown', function(event) {
      event.stopPropagation();
      event.preventDefault();
      if (event.handled !== true) {
        $('#leo_panel').toggle();
        event.handled = true;
      } else {
        return false;
      }
    });

    $('#hot_cnt').bind('touchstart mousedown', function(event) {
      event.stopPropagation();
      event.preventDefault();
      if (event.handled !== true) {
        $('#hot_panel').toggle();
        event.handled = true;
      } else {
        return false;
      }
    });

    $('#reload').click(function() {
      location.reload();
    });

    // var tef_bugs;
    // blockers: tef+, not npotb
    bugzilla.searchBugs(this.params, function(error, bugs) {
    if (!error) {
      // tef_bugs = bugs;
      $('#tef_panel').hide();
      // console.log(bugs);
      var nobody_cnt = 0;
      var outcome = '<ul>';
      for (var i = 0; i < bugs.length; i++) {

        if (moment(bugs[i].creation_time).isAfter(lastest)) {
          hot_bugs.push(bugs[i]);
        }

        if (bugs[i].assigned_to.name === 'nobody@mozilla.org') {
          nobody_cnt += 1;
        }
        outcome += that.format_bug(bugs[i]);
      }
      outcome += '</ul>';
      $('#tef_panel').html(outcome);
      $('#tef_cnt').text(bugs.length);
      $('#tef_nobody_cnt').text('not assigned: ' + nobody_cnt);
      that.emit_hot_cnt_change();
    }
    });

    // var leo_bugs;
    var leo_params = JSON.parse(JSON.stringify(this.params));
    leo_params['value0-0-0'] = 'leo+';
    // blockers: leo+, not npotb
    bugzilla.searchBugs(leo_params, function(error, bugs) {
    if (!error) {
      // leo_bugs = bugs;
      $('#leo_panel').hide();
      // console.log(bugs);
      var nobody_cnt = 0;
      var outcome = '<ul>';
      for (var i = 0; i < bugs.length; i++) {

        if (moment(bugs[i].creation_time).isAfter(lastest)) {
          hot_bugs.push(bugs[i]);
        }

        if (bugs[i].assigned_to.name === 'nobody@mozilla.org') {
          nobody_cnt += 1;
        }
        outcome += that.format_bug(bugs[i]);
      }
      outcome += '</ul>';
      $('#leo_panel').html(outcome);
      $('#leo_cnt').text(bugs.length);
      $('#leo_nobody_cnt').text('not assigned: ' + nobody_cnt);
      that.emit_hot_cnt_change();
    }
    });

    // var mine_bugs;
    mine_params = JSON.parse(JSON.stringify(this.params));
    delete mine_params['value0-0-0'];
    delete mine_params['component'];
    if (my_email !== null) {
      that.emit_myid_change();
    }

  },

  // generate the item
  format_bug: function format_bug(bug) {
    var HOT_FLAG = false;
    // find hot bugs
    var create_time = moment(bug.creation_time);
    if (create_time.isAfter(lastest)) {
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
      mine_params['email1'] = my_email;
      mine_params['email1_assigned_to'] = 1;
      var that = this;
      bugzilla.searchBugs(mine_params, function(error, bugs) {
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
      for (var i = 0; i < hot_bugs.length; i++) {
        outcome += this.format_bug(hot_bugs[i]);
      }
      outcome += '</ul>';
      $('#hot_panel').html(outcome);
      $('#hot_cnt').text(hot_bugs.length);
  },

  input_bugzilla_id: function input_bugzilla_id() {
      my_email = prompt('Enter your bugzilla email' +
                        '(only stored in this browser):');
      // my_password = prompt('Enter your password can show secret bugs:');
      console.log('default account changed to ' + my_email);
      localStorage.my_email = my_email;
      // localStorage.my_password = my_password;
      this.emit_myid_change();
  }
};

window.addEventListener('load', function browserOnLoad(evt) {
  window.removeEventListener('load', browserOnLoad);
  bgzla.init();
});
