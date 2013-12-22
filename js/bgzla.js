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
  my_email: null,
  my_password: null,
  peer1_email: null,
  peer2_email: null,
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
        'product': 'Firefox OS'
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
      delete GAIA.mine_params['field0-0-0'];
      delete GAIA.mine_params['type0-0-0'];
      delete GAIA.mine_params['field1-0-0'];
      delete GAIA.mine_params['type1-0-0'];
      delete GAIA.mine_params['component'];

      GAIA.mine_last_params = JSON.parse(JSON.stringify(GAIA.params));
      delete GAIA.mine_last_params['value0-0-0'];
      delete GAIA.mine_last_params['field0-0-0'];
      delete GAIA.mine_last_params['type0-0-0'];
      delete GAIA.mine_last_params['field1-0-0'];
      delete GAIA.mine_last_params['type1-0-0'];
      delete GAIA.mine_last_params['component'];
      delete GAIA.mine_last_params['bug_status'];
      GAIA.mine_last_params['changed_after'] =
           moment().utc().day(-7).format('YYYY-MM-DD');
      GAIA.mine_last_params['changed_before'] =
           moment().utc().day(1).format('YYYY-MM-DD');

      if (GAIA.my_email !== null) {
        that.emit_myid_change();
      }
    });

    asyncStorage.getItem('peer1_email', function(value) {
      GAIA.peer1_email = value;

      GAIA.peer1_params = JSON.parse(JSON.stringify(GAIA.params));
      delete GAIA.peer1_params['value0-0-0'];
      delete GAIA.peer1_params['field0-0-0'];
      delete GAIA.peer1_params['type0-0-0'];
      delete GAIA.peer1_params['field1-0-0'];
      delete GAIA.peer1_params['type1-0-0'];
      delete GAIA.peer1_params['component'];

      if (GAIA.peer1_email !== null) {
        that.emit_peer1_change();
      }
    });

    asyncStorage.getItem('peer2_email', function(value) {
      GAIA.peer2_email = value;

      GAIA.peer2_params = JSON.parse(JSON.stringify(GAIA.params));
      delete GAIA.peer2_params['value0-0-0'];
      delete GAIA.peer2_params['field0-0-0'];
      delete GAIA.peer2_params['type0-0-0'];
      delete GAIA.peer2_params['field1-0-0'];
      delete GAIA.peer2_params['type1-0-0'];
      delete GAIA.peer2_params['component'];

      if (GAIA.peer2_email !== null) {
        that.emit_peer2_change();
      }
    });

    $('#bgtodo').hide();
    // $('#my_id').click(this.auth_persona_id.bind(this));
    $('#my_id').click(this.input_bugzilla_my_id.bind(this));
    $('#peer1_id').click(this.input_bugzilla_id.bind(this));
    $('#peer2_id').click(this.input_bugzilla_peer2_id.bind(this));

    $('#hot_cnt').bind('touchstart mousedown', function(event) {
      that.toggle_panel(event, '#hot_panel');
    });

    $('#reload').click(function() {
      location.reload();
    });

    this.register_panel('1.3+', '13', this);
    this.register_panel('1.3?', '13q', this);
    this.register_panel('fugu+', 'fugu', this);
    this.register_panel('fugu?', 'fuguq', this);
    this.register_panel('1.4+', '14', this);
    this.register_panel('1.4?', '14q', this);
    // this.register_panel('koi+', 'koi', this);
    // this.register_panel('koi?', 'koiq', this);

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

    // check if has assignee
    var assignee = ' (' + bug.assigned_to.name + ')';
    if (bug.assigned_to.name === 'nobody@mozilla.org') {
      assignee = '';
    }

    var item = '<li id="bug_' + bug.id;
    // if (INACTIVE_FLAG) {
    //   item += '" class="inactive';
    // }
    item += '">';
    if (HOT_FLAG) {
      item += '<i class="icon-rocket"></i> ';
    }
    item += '<a href="http://bugzil.la/' + bug.id + '" target="_blank">' +
            bug.id + '</a> - ';
    if (assignee !== '') {
      if (!mine_flag) {
        item += bug.summary + assignee;
      } else {
        item += bug.summary;
      }
    } else {
      item += '<em>' + bug.summary + '</em>';
    }

    // show hot bug date
    if (HOT_FLAG) {
      item += ' (' + create_time.format('MM/DD') + ')';
    }

    if (bug.status == 'RESOLVED' || bug.status == 'VERIFIED') {
      item += ' <span class="label label-success">Resolved</span>';
    }
    if (INACTIVE_FLAG) {
      item += ' <span class="label label-warning">inactive</span>';
    }
    item += '</li>\n';
    return item;
  },

  register_panel: function(flag, id, that) {
    GAIA['v' + id + '_params'] = JSON.parse(JSON.stringify(GAIA.params));
    GAIA['v' + id + '_params']['value0-0-0'] = flag;
    GAIA.bugzilla.searchBugs(GAIA['v' + id + '_params'],
      function(error, bugs) {
      that['bug_handler_' + id](error, bugs);
    });
    $('#' + id + '_cnt').bind('touchstart mousedown', function(event) {
      that.toggle_panel(event, '#' + id + '_panel');
    });
  },

  emit_myid_change: function() {
      console.log('fetch ' + GAIA.my_email + '/' + GAIA.my_password);

      // use personal auth
      if (GAIA.my_email !== null &&
          GAIA.my_password !== null &&
          GAIA.my_password !== undefined) {
        GAIA.mine_params['username'] = GAIA.my_email;
        GAIA.mine_params['password'] = GAIA.my_password;
      }
      $('#email_id').text(GAIA.my_email);
      $('#bgtodo').show();
      $('#bgtodo').attr('href',
        'http://harthur.github.io/bugzilla-todos/?email=' + GAIA.my_email);
      GAIA.mine_params['email1'] = GAIA.my_email;
      GAIA.mine_params['email1_assigned_to'] = 1;
      var that = this;
      GAIA.bugzilla.searchBugs(GAIA.mine_params, function(error, bugs) {
        if (!error) {
          // console.log(bugs);
          // mine_bugs = bugs;
          var outcome = '<ul>';
          bugs.sort(that.sorters.byLastChangeTime);
          for (var i = 0; i < bugs.length; i++) {
            outcome += that.format_bug(bugs[i], true);
          }
          outcome += '</ul>';
          $('#mine_panel').html(outcome);
          $('#mine_cnt').text(bugs.length);
          $('#mine_panel').show();
        }
      });

      // Find bugs assigned to you and changed last week.
      // use personal auth
      if (GAIA.my_email !== null && GAIA.my_password !== null) {
        GAIA.mine_params['username'] = GAIA.my_email;
        GAIA.mine_params['password'] = GAIA.my_password;
      }
      GAIA.mine_last_params['email1'] = GAIA.my_email;
      GAIA.mine_last_params['email1_assigned_to'] = 1;
      GAIA.bugzilla.searchBugs(GAIA.mine_last_params, function(error, bugs) {
        if (!error) {
          // console.log(bugs);
          // mine_bugs = bugs;
          var outcome = '<ul>';
          bugs.sort(that.sorters.byLastChangeTime);
          for (var i = 0; i < bugs.length; i++) {
            outcome += that.format_bug(bugs[i], true);
            // analyze category size
            // console.log(bugs[i].component);
          }
          outcome += '</ul>';
          $('#mine_last_panel').html(outcome);
          $('#mine_last_cnt').text(bugs.length);
          $('#mine_last_panel').show();
        }
      });
  },

  emit_peer1_change: function() {
      console.log('fetch ' + GAIA.peer1_email);
      $('#peer1_email_id').text(GAIA.peer1_email);
      // $('#bgtodo').show();
      // $('#bgtodo').attr('href',
      // 'http://harthur.github.io/bugzilla-todos/?email='
      // + GAIA.peer1_email);
      GAIA.peer1_params['email1'] = GAIA.peer1_email;
      GAIA.peer1_params['email1_assigned_to'] = 1;
      var that = this;
      GAIA.bugzilla.searchBugs(GAIA.peer1_params, function(error, bugs) {
        if (!error) {
          // console.log(bugs);
          // mine_bugs = bugs;
          var outcome = '<ul>';
          bugs.sort(that.sorters.byLastChangeTime);
          for (var i = 0; i < bugs.length; i++) {
            outcome += that.format_bug(bugs[i], true);
          }
          outcome += '</ul>';
          $('#peer1_panel').html(outcome);
          $('#peer1_cnt').text(bugs.length);
          $('#peer1_panel').show();
        }
      });
  },

  emit_peer2_change: function() {
      console.log('fetch ' + GAIA.peer2_email);
      $('#peer2_email_id').text(GAIA.peer2_email);
      // $('#bgtodo').show();
      // $('#bgtodo').attr('href',
      //   'http://harthur.github.io/bugzilla-todos/?email='
      // + GAIA.peer1_email);
      GAIA.peer2_params['email1'] = GAIA.peer2_email;
      GAIA.peer2_params['email1_assigned_to'] = 1;
      var that = this;
      GAIA.bugzilla.searchBugs(GAIA.peer2_params, function(error, bugs) {
        if (!error) {
          // console.log(bugs);
          // mine_bugs = bugs;
          var outcome = '<ul>';
          bugs.sort(that.sorters.byLastChangeTime);
          for (var i = 0; i < bugs.length; i++) {
            outcome += that.format_bug(bugs[i], true);
          }
          outcome += '</ul>';
          $('#peer2_panel').html(outcome);
          $('#peer2_cnt').text(bugs.length);
          $('#peer2_panel').show();
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

  input_bugzilla_id: function(peer) {
    GAIA.peer1_email = prompt('Enter peer bugzilla email' +
                           ' (only stored in this browser):');
    if (GAIA.peer1_email !== null || GAIA.peer1_email !== undefined) {
      console.log('peer1 account changed to ' + GAIA.peer1_email);
      asyncStorage.setItem('peer1_email', GAIA.peer1_email);
    }
    this.emit_peer1_change();
  },

  input_bugzilla_peer2_id: function(peer) {
    GAIA.peer2_email = prompt('Enter peer bugzilla email' +
                           ' (only stored in this browser):');
    if (GAIA.peer2_email !== null || GAIA.peer2_email !== undefined) {
      console.log('peer2 account changed to ' + GAIA.peer2_email);
      asyncStorage.setItem('peer2_email', GAIA.peer2_email);
    }
    this.emit_peer2_change();
  },

  input_bugzilla_my_id: function(peer) {
    GAIA.my_email = prompt('Enter my bugzilla email' +
                           ' (only stored in this browser):');
    if (GAIA.my_email !== null || GAIA.my_email !== undefined) {
      console.log('my account changed to ' + GAIA.my_email);
      asyncStorage.setItem('peer2_email', GAIA.my_email);
      GAIA.my_password = prompt('Enter my bugzilla password:');
      if (GAIA.my_password !== null || GAIA.my_password !== undefined) {
        asyncStorage.setItem('my_password', GAIA.my_password);
      }
    }
    this.emit_myid_change();
  },

  auth_persona_id: function() {
    var self = this;
    var pRef = new Firebase('https://mozilla-bgzla.firebaseIO.com');
    var authClient = new FirebaseAuthClient(pRef, function(error, user) {
      if (error) {
        // an error occurred while attempting login
        alert(error);
      } else if (user) {
        // user authenticated with Firebase
        // alert('User ID: ' + user.id + ', Provider: ' + user.provider);
        GAIA.my_email = user.email;
        // GAIA.my_password = prompt('Enter bugzilla password to show ' +
        // 'confidential bugs, or just press OK button:');
        if (GAIA.my_email !== null || GAIA.my_email !== undefined) {
          console.log('default account changed to ' + GAIA.my_email);
          asyncStorage.setItem('my_email', GAIA.my_email);
          if (GAIA.my_password !== null || GAIA.my_password !== undefined) {
            asyncStorage.setItem('my_password', GAIA.my_password);
          }
          self.emit_myid_change();
        } else {
          alert('account not changed');
        }
      } else {
        // user is logged out
      }
    });
    authClient.login('persona');
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

  bug_handler_13: function(error, bugs) {
    if (!error) {
      this.base_bug_handler(bugs,
        '#13_panel', '#13_cnt', '#13_nobody_cnt', '13+/');
    }
  },

  bug_handler_fugu: function(error, bugs) {
    if (!error) {
      this.base_bug_handler(bugs,
        '#fugu_panel', '#fugu_cnt', '#fugu_nobody_cnt', 'fugu+/');
    }
  },

  bug_handler_14: function(error, bugs) {
    if (!error) {
      this.base_bug_handler(bugs,
        '#14_panel', '#14_cnt', '#14_nobody_cnt', '14+/');
    }
  },

  /*bug_handler_koi: function(error, bugs) {
    if (!error) {
      this.base_bug_handler(bugs,
        '#koi_panel', '#koi_cnt', '#koi_nobody_cnt', 'koi+/');
    }
  },*/

  bug_handler_13q: function(error, bugs) {
    if (!error) {
      this.base_bug_handler(bugs,
        '#13q_panel', '#13q_cnt', '#13q_nobody_cnt', '13?/');
    }
  },

  bug_handler_14q: function(error, bugs) {
    if (!error) {
      this.base_bug_handler(bugs,
        '#14q_panel', '#14q_cnt', '#14q_nobody_cnt', '14?/');
    }
  },

  bug_handler_fuguq: function(error, bugs) {
    if (!error) {
      this.base_bug_handler(bugs,
        '#fuguq_panel', '#fuguq_cnt', '#fuguq_nobody_cnt', 'fugu?/');
    }
  },

  /*bug_handler_koiq: function(error, bugs) {
    if (!error) {
      this.base_bug_handler(bugs,
        '#koiq_panel', '#koiq_cnt', '#koiq_nobody_cnt', 'koi?/');
    }
  },*/

  contains: function(trend_list, obj, subfix) {
    for (var i in trend_list) {
      // console.log(i + ' 6:00AM/'+obj);
      if(obj === i + subfix) {
        return 1;
      }
    }
    return 0;
  },

  prepare_data: function(base_trend, trend_obj, fence, subfix) {
    var trend_list = [];
    var skip = false;
    for (var j in base_trend) {
          var target = base_trend[j][0];
          if (!skip) {
            if (this.contains(trend_obj, target, subfix) === 0) {
              trend_list.push([target, 0]);
            } else {
              skip = true;
            }
          }
        }
        for (var i in trend_obj) {
          if (moment(i, 'YYYY-MM-DD').isAfter(fence)) {
            trend_list.push([i + subfix, trend_obj[i]]);
          }
        }
    return trend_list;
  },

  plot_trend: function() {
    var trend_1 = [];
    var trend_2 = [];
    var trend_3 = [];
    var trend_4 = [];
    var self = this;

    var plotRef = new Firebase(GAIA.dataRef);
    plotRef.on('value', function(snapshot) {
      if (snapshot.val() !== null) {
        var data = snapshot.val();
        var fence = moment().day(-46);
        var subfix = ' 6:00AM';

        // trend_1 = self.prepare_data([],
        //   data['koi '],
        //   fence, subfix);
        // var base_trend = trend_1;
        // trend_2 = self.prepare_data(base_trend,
        //   data['fugu '],
        //   fence, subfix);
        trend_3 = self.prepare_data(base_trend,
          data['13 '],
          fence, subfix);
        var base_trend = trend_3;
        trend_4 = self.prepare_data(base_trend,
          data['14 '],
          fence, subfix);

        var plot1 = $.jqplot('daily_trend',
          [/*trend_1, trend_2, */trend_3, trend_4], {
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
              drawMajorGridlines: false,
              tickInterval: '7 day'
            },
            yaxis: {min: 0}
          },
          series: [
            /*{label: 'koi+'},
            {label: 'fugu+'},*/
            {label: '1.3+'},
            {label: '1.4+'}
          ],
          seriesDefaults: {
            fill: true
            // lineWidth: 4,
            // renderer: $.jqplot.BarRenderer,
            // rendererOptions: {},
            // pointLabels: {show: true, edgeTolerance: -15}
          },
          highlighter: {
            show: true,
            sizeAdjust: 7.5
          },
          cursor: {
            show: true
          }
        });
      }
    });
  },

  // a list of sorting functions
  sorters: {
      byIdDesc: function(a, b) {
          return (b.id - a.id);
      },
      byLastChangeTime: function(a, b) {
        var a_last = moment(a.last_change_time);
        var b_last = moment(b.last_change_time);
        return a_last.isBefore(b_last);
      }
  }
};

window.addEventListener('load', function browserOnLoad(evt) {
  window.removeEventListener('load', browserOnLoad);
  bgzla.init();
});
