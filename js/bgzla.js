function format_bug(bug) {
  var assignee = ' (' + bug.assigned_to.name + ')';
  if (bug.assigned_to.name === 'nobody@mozilla.org') {
    assignee = '';
  }
  var item = '<li id="bug_' + bug.id + '">';
  item += '[<a href="http://bugzil.la/' + bug.id + '">' +
          bug.id + '</a>] ';
  if (assignee !== '') {
    item += bug.summary + assignee;
  } else {
    item += '<em>' + bug.summary + '</em>';
  }
  item += '</li>\n';
  return item;
}

// init
jQuery(document).ready(function($) {
  var bugzilla = bz.createClient();
  $('#tef_cnt').bind('touchstart click', function(event) {
    event.stopPropagation();
    event.preventDefault();
    if (event.handled !== true) {
      $('#tef_panel').toggle();
      event.handled = true;
    } else {
      return false;
    }
  });

  $('#leo_cnt').bind('touchstart click', function(event) {
    event.stopPropagation();
    event.preventDefault();
    if (event.handled !== true) {
      $('#leo_panel').toggle();
      event.handled = true;
    } else {
      return false;
    }
  });

  var params = {
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
    };

  var tef_bugs;
  // blockers: tef+, not npotb
  bugzilla.searchBugs(params, function(error, bugs) {
  if (!error) {
    tef_bugs = bugs;
    $('#tef_panel').hide();
    // console.log(bugs);
    var nobody_cnt = 0;
    var outcome = '<ul>';
    for (var i = 0; i < bugs.length; i++) {
      if (bugs[i].assigned_to.name === 'nobody@mozilla.org') {
        nobody_cnt += 1;
      }
      outcome += format_bug(bugs[i]);
    }
    outcome += '</ul>';
    $('#tef_panel').html(outcome);
    $('#tef_cnt').text(bugs.length);
    $('#tef_nobody_cnt').text('not assigned: ' + nobody_cnt);
  }
  });

  var leo_bugs;
  leo_params = JSON.parse(JSON.stringify(params));
  leo_params['value0-0-0'] = 'leo+';
  // blockers: leo+, not npotb
  bugzilla.searchBugs(leo_params, function(error, bugs) {
  if (!error) {
    leo_bugs = bugs;
    $('#leo_panel').hide();
    // console.log(bugs);
    var nobody_cnt = 0;
    var outcome = '<ul>';
    for (var i = 0; i < bugs.length; i++) {
      if (bugs[i].assigned_to.name === 'nobody@mozilla.org') {
        nobody_cnt += 1;
      }
      outcome += format_bug(bugs[i]);
    }
    outcome += '</ul>';
    $('#leo_panel').html(outcome);
    $('#leo_cnt').text(bugs.length);
    $('#leo_nobody_cnt').text('not assigned: ' + nobody_cnt);
  }
  });

});


