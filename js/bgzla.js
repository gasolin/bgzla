/*
 *
 * Author: Fred Lin (gasolin@mozilla.com)
 * Mozilla License
 *
 */
'use strict';

var GAIA = {
  lastest: moment().day(-7),
  inactive: moment().day(-4),
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
                      'Gaia::Settings', 'Gaia::SMS', 'Gaia::System',
                      'Gaia::System::Lockscreen', 'Gaia::Video', 'General'
                     ],
        'product': 'Boot2Gecko'
  },
  dataRef: 'https://mozilla-bgzla.firebaseIO.com/flag/'
};

var bgzla = {
  // init
  init: function() {
    GAIA.bugzilla = bz.createClient();

    var that = this;

    asyncStorage.getItem('my_email', function(value) {
      GAIA.my_email = value;
      // var mine_bugs;
      GAIA.mine_params = JSON.parse(JSON.stringify(GAIA.params));
      delete GAIA.mine_params['value0-0-0'];
      delete GAIA.mine_params['component'];

      GAIA.mine_last_params = JSON.parse(JSON.stringify(GAIA.params));
      delete GAIA.mine_last_params['value0-0-0'];
      delete GAIA.mine_last_params['component'];

      if (GAIA.my_email !== null) {
        that.emit_myid_change();
      }
    });
    // var my_password = localStorage.my_password || null;

    $('#my_id').click(this.input_bugzilla_id.bind(this));

    $('#mine_cnt').bind('touchstart mousedown', function(event) {
      that.toggle_panel(event, '#mine_panel');
    });

    $('#hot_cnt').bind('touchstart mousedown', function(event) {
      that.toggle_panel(event, '#hot_panel');
    });

    $('#reload').click(function() {
      location.reload();
    });

    // var tef_bugs;
    GAIA.tef_params = JSON.parse(JSON.stringify(GAIA.params));
    GAIA.tef_params['value0-0-0'] = 'hd+';
    // blockers: tef+, not npotb
    GAIA.bugzilla.searchBugs(GAIA.tef_params, function(error, bugs) {
      that.bug_handler_tef(error, bugs);
    });

    $('#tef_cnt').bind('touchstart mousedown', function(event) {
      that.toggle_panel(event, '#tef_panel');
    });

    // var leo_bugs;
    GAIA.leo_params = JSON.parse(JSON.stringify(GAIA.params));
    GAIA.leo_params['value0-0-0'] = 'leo+';
    // blockers: leo+, not npotb
    GAIA.bugzilla.searchBugs(GAIA.leo_params, function(error, bugs) {
      that.bug_handler_leo(error, bugs);
    });

    $('#leo_cnt').bind('touchstart mousedown', function(event) {
      that.toggle_panel(event, '#leo_panel');
    });

    // var koi_bugs;
    GAIA.koi_params = JSON.parse(JSON.stringify(GAIA.params));
    GAIA.koi_params['value0-0-0'] = 'koi+';
    // blockers: leo+, not npotb
    GAIA.bugzilla.searchBugs(GAIA.koi_params, function(error, bugs) {
      that.bug_handler_koi(error, bugs);
    });

    $('#koi_cnt').bind('touchstart mousedown', function(event) {
      that.toggle_panel(event, '#koi_panel');
    });

    GAIA.leoq_params = JSON.parse(JSON.stringify(GAIA.params));
    GAIA.leoq_params['value0-0-0'] = 'leo?';
    // blockers: tef+, not npotb
    GAIA.bugzilla.searchBugs(GAIA.leoq_params, function(error, bugs) {
      that.bug_handler_leoq(error, bugs);
    });

    $('#leoq_cnt').bind('touchstart mousedown', function(event) {
      that.toggle_panel(event, '#leoq_panel');
    });

    GAIA.hdq_params = JSON.parse(JSON.stringify(GAIA.params));
    GAIA.hdq_params['value0-0-0'] = 'hd?';
    // blockers: tef+, not npotb
    GAIA.bugzilla.searchBugs(GAIA.hdq_params, function(error, bugs) {
      that.bug_handler_hdq(error, bugs);
    });

    $('#leoq_cnt').bind('touchstart mousedown', function(event) {
      that.toggle_panel(event, '#leoq_panel');
    });

    GAIA.koiq_params = JSON.parse(JSON.stringify(GAIA.params));
    GAIA.koiq_params['value0-0-0'] = 'koi?';
    // blockers: tef+, not npotb
    GAIA.bugzilla.searchBugs(GAIA.koiq_params, function(error, bugs) {
      that.bug_handler_koiq(error, bugs);
    });
    $('#koiq_cnt').bind('touchstart mousedown', function(event) {
      that.toggle_panel(event, '#koiq_panel');
    });

    this.plot_trend();
  },

  // generate the item
  format_bug: function(bug, mine_flag) {
    var HOT_FLAG = false;
    // find hot bugs
    var create_time = moment(bug.creation_time);
    if (create_time.isAfter(GAIA.lastest)) {
      HOT_FLAG = true;
    }
    var INACTIVE_FLAG = false;
    var last_change_time = moment(bug.last_change_time);
    if (last_change_time.isBefore(GAIA.inactive)) {
      INACTIVE_FLAG = true;
    }

    if (!mine_flag) {
      // check if has assignee
      var assignee = ' (' + bug.assigned_to.name + ')';
      if (bug.assigned_to.name === 'nobody@mozilla.org') {
        assignee = '';
      }
    }

    var item = '<li id="bug_' + bug.id;
    if (INACTIVE_FLAG) {
      item += '" class="inactive';
    }
    item += '">';
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

    if (bug.status == 'RESOLVED') {
      item += ' <span class="label label-success">Resolved</span>';
    }
    item += '</li>\n';
    return item;
  },

  emit_myid_change: function() {
      // console.log('fetch ' + my_email + '/' + my_password);

      // use personal auth
      // if (my_email!==null && my_password!==null) {
      //   mine_params['username'] = my_email;
      //   mine_params['password'] = my_password;
      // }
      $('#email_id').text(GAIA.my_email);
      GAIA.mine_params['email1'] = GAIA.my_email;
      GAIA.mine_params['email1_assigned_to'] = 1;
      var that = this;
      GAIA.bugzilla.searchBugs(GAIA.mine_params, function(error, bugs) {
        if (!error) {
          // console.log(bugs);
          // mine_bugs = bugs;
          var outcome = '<ul>';
          bugs.sort(that.sorters.byIdDesc);
          for (var i = 0; i < bugs.length; i++) {
            outcome += that.format_bug(bugs[i], true);
          }
          outcome += '</ul>';
          $('#mine_panel').html(outcome);
          $('#mine_cnt').text(bugs.length);
          $('#mine_panel').show();
        }
      });

      // Find bugs assigned to you and last changed date is last monday.
      GAIA.mine_last_params['email1'] = GAIA.my_email;
      GAIA.mine_last_params['email1_assigned_to'] = 1;
      GAIA.mine_last_params['chfieldfrom'] =
           moment().utc().day(-6).format('YYYY-MM-DD');
      GAIA.mine_last_params['bug_status'] = [];
      GAIA.bugzilla.searchBugs(GAIA.mine_last_params, function(error, bugs) {
        if (!error) {
          // console.log(bugs);
          // mine_bugs = bugs;
          var outcome = '<ul>';
          bugs.sort(that.sorters.byIdDesc);
          for (var i = 0; i < bugs.length; i++) {
            outcome += that.format_bug(bugs[i], true);
          }
          outcome += '</ul>';
          $('#mine_last_panel').html(outcome);
          $('#mine_last_cnt').text(bugs.length);
          $('#mine_last_panel').show();
        }
      });
  },

  emit_hot_cnt_change: function() {
      var outcome = '<ul>';
      GAIA.hot_bugs.sort(this.sorters.byIdDesc);
      for (var i = 0; i < GAIA.hot_bugs.length; i++) {
        outcome += this.format_bug(GAIA.hot_bugs[i], false);
      }
      outcome += '</ul>';
      $('#hot_panel').hide();
      $('#hot_panel').html(outcome);
      $('#hot_cnt').text(GAIA.hot_bugs.length);
  },

  input_bugzilla_id: function() {
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

  toggle_panel: function(event, panel_id) {
    event.stopPropagation();
    event.preventDefault();
    if (event.handled !== true) {
      $(panel_id).toggle();
      event.handled = true;
    } else {
      return false;
    }
  },

  base_bug_handler: function(bugs, panel, cnt, nobody, tag) {
    $(panel).hide();
    // console.log(bugs);
    var nobody_cnt = 0;
    var outcome = '<ul>';
    bugs.sort(this.sorters.byIdDesc);
    for (var i = 0; i < bugs.length; i++) {

      if (moment(bugs[i].creation_time).isAfter(GAIA.lastest)) {
        GAIA.hot_bugs.push(bugs[i]);
      }

      if (bugs[i].assigned_to.name === 'nobody@mozilla.org') {
        nobody_cnt += 1;
      }
      outcome += this.format_bug(bugs[i], false);
    }
    outcome += '</ul>';
    $(panel).html(outcome);
    $(cnt).text(bugs.length);
    $(nobody).text('not assigned: ' + nobody_cnt);
    this.emit_hot_cnt_change();

    var todayRef = new Firebase(GAIA.dataRef + tag +
      moment.utc().format('YYYY-MM-DD'));
    todayRef.on('value', function(snapshot) {
      if (snapshot.val() === null) {
        todayRef.set(0);
      } else {
        if (bugs.length > snapshot.val()) {
          console.log('update');
          todayRef.set(bugs.length);
        }
      }
    });
  },

  bug_handler_tef: function(error, bugs) {
    if (!error) {
      this.base_bug_handler(bugs,
        '#tef_panel', '#tef_cnt', '#tef_nobody_cnt', 'hd+/');
    }
  },

  bug_handler_leo: function(error, bugs) {
    if (!error) {
      this.base_bug_handler(bugs,
        '#leo_panel', '#leo_cnt', '#leo_nobody_cnt', 'leo+/');
    }
  },

  bug_handler_koi: function(error, bugs) {
    if (!error) {
      this.base_bug_handler(bugs,
        '#koi_panel', '#koi_cnt', '#koi_nobody_cnt', 'koi+/');
    }
  },

  bug_handler_leoq: function(error, bugs) {
    if (!error) {
      this.base_bug_handler(bugs,
        '#leoq_panel', '#leoq_cnt', '#leoq_nobody_cnt', 'leo?/');
    }
  },

  bug_handler_hdq: function(error, bugs) {
    if (!error) {
      this.base_bug_handler(bugs,
        '#hdq_panel', '#hdq_cnt', '#hdq_nobody_cnt', 'hd?/');
    }
  },

  bug_handler_koiq: function(error, bugs) {
    if (!error) {
      this.base_bug_handler(bugs,
        '#koiq_panel', '#koiq_cnt', '#koiq_nobody_cnt', 'koi?/');
    }
  },

  plot_trend: function() {
    var trend_1 = [];
    var trend_2 = [];
    var trend_3 = [];

    var tefRef = new Firebase(GAIA.dataRef);
    tefRef.on('value', function(snapshot) {
      if (snapshot.val() !== null) {
        var data = snapshot.val();
        var subfix = ' 6:00AM';
        // console.log(that.data);
        for (var i in data['leo ']) {
          trend_1.push([i + subfix, data['leo '][i]]);
        }
        for (var i in data['hd ']) {
          trend_2.push([i + subfix, data['hd '][i]]);
        }
        for (var i in data['koi ']) {
          trend_3.push([i + subfix, data['koi '][i]]);
        }
        // console.log(line1);
        var plot1 = $.jqplot('daily_trend', [trend_1, trend_2, trend_3], {
          title: 'Daily Trend',
          stackSeries: true,
          legend: {
              renderer: $.jqplot.EnhancedLegendRenderer,
              show: true,
              placement: 'insideGrid',
              location: 's',
              rendererOptions: {
                numberRows: 1
              }
          },
          axes: {
            xaxis: {
              renderer: $.jqplot.DateAxisRenderer,
              tickOptions: {
                formatString: '%b %#d',
                angle: -20
              },
              tickInterval: '1 day'
            }
          },
          series: [
            {label: 'leo+'},
            {label: 'hd+'},
            {label: 'koi+'}
          ],
          seriesDefaults: {
            lineWidth: 4,
            renderer: $.jqplot.BarRenderer,
            rendererOptions: {},
            pointLabels: {show: true, edgeTolerance: -15}
          }
        });
      }
    });
  },

  // a list of sorting functions
  sorters: {
      byIdDesc: function(a, b) {
          return (b.id - a.id);
      }
  }
};

window.addEventListener('load', function browserOnLoad(evt) {
  window.removeEventListener('load', browserOnLoad);
  bgzla.init();
});
