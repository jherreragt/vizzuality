var _ = require('underscore');
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var root = process.cwd();
var file = require(root + '/app/helpers/file');
var teamPath = root + '/content/team';
var OLDMEMBERS = [
  'henrick', 'kartones', 'rbarroso', 'eduardo-villuendas', 'jatorre'
];
var MEMBERS = {
  'andres_gonzalez': 'andres-gonzalez',
  'david_inga': 'david-inga',
  'jose_hernandez': 'jose-hernandez',
  'tiago_garcia': 'tiago-garcia',
  'sebastian_schkundlara': 'sebastian-schkundlara',
  'simao_belchior': 'simao-belchior'
};

var teamOrder = require(root + '/config/team.json');

module.exports = function(app) {

  'use strict';

  var isProduction = (app.get('env') === 'production');
  var t = Math.pow(10, 15);

  // About page
  app.get('/about', csrfProtection, function(req, res) {
    file.getFiles(teamPath, isProduction, function(err, data) {
      var result = [];
      for (var i = 0, len = teamOrder.length; i < len; i++) {
        var member = _.findWhere(data, {slug: teamOrder[i]});
        result.push(member);
      }
      res.render('about/index', {
        team: result,
        className: 'is-about-page',
        csrfToken: req.csrfToken()
      });
    });
  });

  // Team page
  app.get('/about/:member', function(req, res) {

    var result, index;

    if (_.contains(OLDMEMBERS, req.params.member)) {
      return res.redirect('/about');
    } else if (MEMBERS[req.params.member]) {
      return res.redirect('/about/' + MEMBERS[req.params.member]);
    }

    file.getFiles(teamPath, isProduction, function(err, team) {

      team = _.sortBy(team, function(d) {
        var time = new Date(d.date).valueOf();
        var order = d.order ? parseInt(d.order) : 0;
        return (order * t) + time;
      });

      _.each(team, function(member, i) {
        if (member.slug === req.params.member) {
          result = member;
          index = i;
        }
      });

      res.render('about/team', {
        data: result,
        prev: team[index - 1],
        next: team[index + 1],
        content: result.html,
        className: 'is-team-page'
      });

    });

  });

  // Redirects
  app.get('/team', function(req, res) {
    res.redirect('/about');
  });

  app.get('/team/:member', function(req, res) {
    if (_.contains(OLDMEMBERS, req.params.member)) {
      return res.redirect('/about');
    } else if (MEMBERS[req.params.member]) {
      return res.redirect('/about/' + MEMBERS[req.params.member]);
    }
    res.redirect('/about');
  });

};
