/*
var managers = [
  { name: 'Tim Guan-tin Chien', email: 'tchien@mozilla.com'},
  { name: 'Keven Kuo', email: 'kkuo@mozilla.com'}
]
var teams = {};
teams['tchien'] = [
  'timdream@gmail.com',
  'arthur.chen@mozilla.com',
  'schung@mozilla.com',
  'ehung@mozilla.com',
  'yurenju.mozilla@gmail.com',
  'dkuo@mozilla.com',
  'rexboy@mozilla.com',
  'gasolin@mozilla.com',
  'iliu@mozilla.com',
  'rlu@mozilla.com',
  'mshiao@mozilla.com',
  'etseng@mozilla.com',
  'alive@mozilla.com',
]
teams['kkuo'] = [
  'kkuo@mozilla.com',
  'pchang@mozilla.com',
  'mchen@mozilla.com',
  'shuang@mozilla.com',
  'ahuang@mozilla.com',
  'rlin@mozilla.com',
  'vliu@mozilla.com',
  'btian@mozilla.com',
  'vwang@mozilla.com',
]
*/


/*bugzilla.getBug(678223, function(error, bug) {
if (!error) {
  $('#panel').text(bug.summary);
}
});*/


/*
// get week start and end date
var now = Date();
var startDay = 1; //0=sunday, 1=monday etc.
var d = now.getDay(); //get the current day
var weekStart = new Date(now.valueOf() -
                (d <= 0 ?
                        7 - startDay :
                        d - startDay) * 86400000); //rewind to start day
var weekEnd = new Date(weekStart.valueOf() +
                       6 * 86400000); //add 6 days to get last day
*/

/*
//blockers-tef-no-npotb-before-workweek
{
    'username': 'autonome+bztest@gmail.com',
    'password': 'bztest1A',
    'bug_status': ["NEW", "UNCONFIRMED", "ASSIGNED", "REOPENED", "READY"],
    'field0-0-0': 'cf_blocking_b2g',
    'type0-0-0': 'contains',
    'value0-0-0': 'tef+',
    'field1-0-0': 'whiteboard',
    'type1-0-0': 'not_contains',
    'value1-0-0': 'npotb',
    'changed_field': '[Bug creation]',
    'changed_before': '2013-04-14 11:00',
  }

 // closed at workweek
 {
    'username': 'autonome+bztest@gmail.com',
    'password': 'bztest1A',
    'bug_status': ['RESOLVED', 'VERIFIED'],
    'resolution': 'FIXED',
    'field0-0-0': 'cf_blocking_b2g',
    'type0-0-0': 'equals',
    'value0-0-0': 'tef+',
    'field1-0-0': 'whiteboard',
    'type1-0-0': 'not_contains',
    'value1-0-0': 'npotb',
    'changed_field': 'resolution',
    'changed_field_to': 'FIXED',
    'changed_after': '2013-04-14 11:00',
  }

  // new at workweek
  {
    'username': 'autonome+bztest@gmail.com',
    'password': 'bztest1A',
    'bug_status': ["NEW", "UNCONFIRMED", "ASSIGNED", "REOPENED", "READY"],
    'field0-0-0': 'cf_blocking_b2g',
    'type0-0-0': 'equals',
    'value0-0-0': 'tef+',
    'field1-0-0': 'whiteboard',
    'type1-0-0': 'not_contains',
    'value1-0-0': 'npotb',
    'changed_field': '[Bug creation]',
    'changed_after': '2013-04-14 11:00',
  }
  */