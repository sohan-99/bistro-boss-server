const express = require('express')
var jwt = require('jsonwebtoken');
var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middlewere 
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.julqny1.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    await client.connect();
 // Get the database and collection on which to run the operation
 const usercollection = client.db("bistroDB").collection("users");
 const menucollection = client.db("bistroDB").collection("menu");
 const reviewcollection = client.db("bistroDB").collection("reviews");
 const cartcollection = client.db("bistroDB").collection("carts");


  // jwt related api
  app.post('/jwt', async (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.send({ token });
  })


   // middlewares 
   const verifyToken = (req, res, next) => {
    console.log('inside verify token', req.headers.authorization);
    // if (!req.headers.authorization) {
    //   return res.status(401).send({ message: 'unauthorized access' });
    // }
    // const token = req.headers.authorization.split(' ')[1];
    // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    //   if (err) {
    //     return res.status(401).send({ message: 'unauthorized access' })
    //   }
    //   req.decoded = decoded;
    //   next();
    // })
    next();
  }

// user related api
app.get('/users', verifyToken, async(req, res)=>{
  console.log(req.headers);
  const result = await usercollection.find().toArray();
  res.send(result);
})


app.post('/users' , async(req, res)=>{
  const user = req.body;

   // insert email if user doesnt exists: 
      // you can do this many ways (1. email unique, 2. upsert 3. simple checking)
      const query = { email: user.email }
      const existingUser = await usercollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }

  const result  = await usercollection.insertOne(user);
  res.send(result);
})

app.patch('/users/admin/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      role: 'admin'
    }
  }
  const result = await usercollection.updateOne(filter, updatedDoc);
  res.send(result);
})


app.delete('/users/:id', async(req, res)=>{
  const id = req.params.id;
  const query = { _id: new ObjectId(id)}
  const result = await usercollection.deleteOne(query);
  res.send(result);
})

//  data get in menu 
app.get('/menu', async(req, res)=>{
    const result = await menucollection.find().toArray();
    res.send(result);
})
// reviews data get
app.get('/reviews', async(req, res)=>{
    const result = await reviewcollection.find().toArray();
    res.send(result);
})


 // carts collection 
 app.get('/carts', async (req, res) => {
  const email = req.query.email;
  const query = { email: email };
  const result = await cartcollection.find(query).toArray();
  res.send(result);
});

// delete a item
app.delete('/carts/:id', async(req, res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const  result = await cartcollection.deleteOne(query);
  res.send(result)
})

// post 
app.post('/carts',async(req, res)=>{
  const cartItem= req.body;
  const result = await cartcollection.insertOne(cartItem);
  res.send(result);
})
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req, res)=>{
    res.send('boss is sitting')
})

app.listen(port, ()=>{
    console.log(`Bistro Boss is port ${port}`);
})


/**
 * --------------------------------
 *      NAMING CONVENTION
 * --------------------------------
 * app.get('/users')
 * app.get('/users/:id')
 * app.post('/users')
 * app.put('/users/:id')
 * app.patch('/users/:id')
 * app.delete('/users/:id')
 * 
*/
