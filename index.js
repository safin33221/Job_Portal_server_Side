const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 3000


app.use(cors())
app.use(express.json())







const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.blz8y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // await client.connect();

        //jobs collection 
        const jobCollection = client.db('JobPortal').collection('jobs')
        const jobApplicationCollection = client.db('JobPortal').collection('job_application')

        app.get('/jobs', async (req, res) => {
            const cursor = jobCollection.find()
            const result = await cursor.toArray()
            res.send(result)

        })

        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await jobCollection.findOne(filter)
            res.send(result)
        })




        app.get('/job-application', async (req, res) => {
            const email = req.query.email
            const filter = { applicant: email }
            const result = await jobApplicationCollection.find(filter).toArray()

            for (const item of result) {
                
                const query1 = { _id: new ObjectId(item.job_Id) }
                const job = await jobCollection.findOne(query1)
                if (job) {
                    item.title = job.title;
                    item.company = job.company;
                    item.company_logo = job.company_logo;
                    item.location = job.location;
                    item.category = job.category;
                    item.applicationDeadline = job.applicationDeadline;
                }
            }
            res.send(result)
        })
        app.post('/job-application', async (req, res) => {
            const application = req.body
            const result = await jobApplicationCollection.insertOne(application)
            res.send(result)
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


app.get('/', (req, res) => {
    res.send('server is running without error')
})

app.listen(port, () => {
    console.log(`server running on ${port}`);
})