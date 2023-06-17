const express = require('express');
const cors = require('cors');
require('dotenv').config()

const app = express();

const port = process.env.PORT || 5000;


//middleware
app.use(cors())
app.use(express.json())

//mongoDB


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.birk0vz.mongodb.net/?retryWrites=true&w=majority`;

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
    

    const usersCollection = client.db('languageLeapDB').collection("users");
    const classesCollection = client.db('languageLeapDB').collection("classes");

//All Users
    app.post('/users', async(req, res)=>{
        const user = req.body;
        const query = {email: user.email}
        const existingStudent = await usersCollection.findOne(query);
        if(existingStudent){
            return res.send({message:"Student Account Already Exist"})
        }
        const result = await usersCollection.insertOne(user);
        res.send(result)
    })

    app.get('/users', async(req, res)=>{
      const result = await usersCollection.find().toArray();
      res.send(result)
    })

    //admin
    app.patch('/users/admin/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const updateRole = {
        $set:{
          admin:'admin'
        }
      }
      const result = await usersCollection.updateOne(query, updateRole);
      res.send(result)
    })

    
    app.get('/userroll', async(req, res)=>{
      const email = req.query.email;
      if(!email){
        res.send([])
      }
      const query = {email:email}
      const result = await usersCollection.find(query).toArray();
      res.send(result)
    })

    app.get('/classes', async(req, res)=>{
      const result = await classesCollection.find().toArray();
      res.send(result)
    })

    app.put('/updtstatus/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const options = {upsert:true};
      const updateStatus = req.body;
      const updateDoc = {
        $set:{
          status:updateStatus.status
        }
      }
      const result = await classesCollection.updateOne(query, updateDoc,options)
      res.send(result)
    })

    app.patch('/addfeedback/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const newFeedback = req.body;
      const updateDoc ={
        $set:{
          feedback:newFeedback.text
        }
      }
      const result = classesCollection.updateOne(query, updateDoc)
      res.send(result)
    })


    //Instructor
    app.patch('/users/instructor/:id', async(req, res)=>{
      const id = req.params.id;
      query = {_id : new ObjectId(id)}

      const updateRole ={
        $set:{
          instructor : 'instructor'
        }
      }
      const result = await usersCollection.updateOne(query, updateRole);
      res.send(result)
    })


    //Class Collection
    app.post('/classes',async(req, res)=>{
      const addClass = req.body;
      const result = await classesCollection.insertOne(addClass);
      res.send(result)
    })

    app.get('/myclasses', async(req, res)=>{
      const email = req.query.email;
      if(!email){
        res.send([])
      }
      const query = {iEmail:email}
      const result = await classesCollection.find(query).toArray();
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req,res)=>{
  res.send("Language Leap Server is running")
})



app.listen(port, ()=>{
    console.log(`language leap server is running port: ${port}`)
})