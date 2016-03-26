var Twit = require('twit'),
  _ = require('underscore'),
  config = require('./config');

var T = new Twit(config.twitter);

var bannedPhrases = [
  /cheese/i,
  /herbal/i,
  /soap/i,
  /milk/i,
  /butter/i,
  /weed/i,
  /hair/i,
  /leather/i,
  /quran/i,
  /simulator/i,
  /shearing clipper/i
];

var stream = T.stream('statuses/filter', { track: 'goat' });

stream.on('tweet', function (tweet) {
  var bannedPhrase;

  if(tweet.retweeted) {
    return printSkip(tweet, 'Rewtweeted tweet');
  }
  if(tweet.user.followers_count < 40) {
    return printSkip(tweet, 'low follower count (' + tweet.user.followers_count + ')');
  }
  if(tweet.text[0] === '@') {
    return printSkip(tweet, 'Tweeted @');
  }
  if(tweet.text.indexOf('RT') === 0) {
    return printSkip(tweet, 'RT');
  }
  if(tweet.text.indexOf('GOAT') >= 0) {
    return printSkip(tweet, 'GOAT');
  }

  if(bannedPhrase = hasBannedPhrase(tweet)) {
    return printSkip(tweet, 'banned phrase (' + bannedPhrase + ')');
  }

  if(!hasImage(tweet)) {
    return printSkip(tweet, 'no image');
  }

  console.log('Great Tweet:', tweet.text);
  retweetThis(tweet);
});

function hasImage(tweet) {
  if(!tweet.entities.media) {
    return false;
  }

  return _.some(tweet.entities.media, function(media) {
    return media.type === 'photo';
  });
}

function retweetThis(tweet) {
  T.post('statuses/retweet/:id', { id: tweet.id_str }, function (err, data, response) {
    if(err) {
      console.error('error retweeting', JSON.stringify(err));
      return;
    }
    console.log('...retweeted...', tweet.text);
  });
}

function hasBannedPhrase(tweet) {
  return _.find(bannedPhrases, function(bannedPhrase) {
    return bannedPhrase.test(tweet.text);
  });
}

function printSkip(tweet, msg) {
  console.log('Skip -', msg, '[' + tweet.user.screen_name + ']:', tweet.text);
}