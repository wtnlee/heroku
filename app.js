const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const mongoose = require('mongoose');
var session = require('express-session');
const bcrypt = require('bcryptjs')
const User = require('./models/User')

const graphQLSchema = require('./graphql/schema/index');
const graphQLResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth')

const app = express();

app.use(session({ secret: 'goalsecret', resave: true,
saveUninitialized: true , cookie: { secure: false }
}));


var userMap = {};
module.exports.userMap = userMap;




app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
//   extended: true
// }));
// app.use(express.json());       // to support JSON-encoded bodies
// app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(express.json());       // to support JSON-encoded bodies

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.header( "Access-Control-Allow-Credentials", true );
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

//app.use(isAuth);

app.post('/login', async function (req, res) {

  if (!req.session.userid) {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw new Error('User does not exist');
    }

    const isEqual = await bcrypt.compare(req.body.password, user.password);
    if (!isEqual) {
      //throw new Error('Password is incorrect');
      res.send({ "login": false });
    }
   // console.log("SUCCESFUL LOG IN AS: " + user.id);
    console.log("SUCCESFUL LOG IN AS: " + req.session.id);

    req.session.userid = user.id;
    res.json({ "login": true });
  }
  else {
    req.session.userid = user.id;
    req.session.save();


    res.json({ "login": "WTF" });
  }
});

app.get('/logout', function (req, res) {
  console.log(req.session.id + " logout");
  req.session.userid = undefined;
  res.json({"login" : false});
});

app.get('/checkLogin', function (req, res) {
  console.log(req.session.id + " in CHECK LOGIN");
  if(!req.session.userid){
    console.log("REACHED HERE")

  res.json({"login" : false});
  }
  else{
    res.json({"login" : true});
  }
});

app.get('/searchQuery/:user', function (req, res){
  var query = req.params.user;
  var split = query.split("@");

  var results = [];

  if(split.length ==  1){

  for(var entry in userMap){
     var arr = entry.split("@");
     if(arr[0].toLowerCase().includes(split[0])){
       results.push(entry);
     }
  }
  }
  else if (split.length == 2){
    for(var entry in userMap){
    var arr = entry.split("@");
    if(arr[0].toLowerCase().includes(split[0])){
      results.push(entry);
    }
  }
  }
  res.json(results);
})



app.use(
  '/graphql',
  graphqlHttp({
    schema: graphQLSchema,
    rootValue: graphQLResolvers,
    graphiql: true
  })
);

// app.use(
//   '/graphiql',
//   graphiqlExpress({
//     endpointURL: '/graphql'
//   })
// )

mongoose.connect(
  process.env.DATABASE_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(() => {
  console.log('database connection succeeded, server started');
  app.listen(process.env.PORT);
  User.find({}, function(err, result){
    if(err){console.log(err); return;}

    for(var i = 0; i < result.length; i++){
      userMap[result[i]['email']] = result[i]['_id'];
    }



    console.log('Ready to search for friends');

  });

}).catch(err => {
    console.log('database connection failed, server not started');
    console.log(err);
  })
