import { MongoClient, ObjectId } from 'mongodb'
import * as bcrypt from 'bcrypt'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// MongoDB connection string
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/courses'

async function seed() {
  console.log('Starting seed process...')
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db()
    
    // Create admin user
    const usersCollection = db.collection('users')
    const adminExists = await usersCollection.findOne({ email: 'admin@example.com' })
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      const adminUser = {
        _id: new ObjectId(),
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        roles: ['ADMIN', 'USER'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      await usersCollection.insertOne(adminUser)
      console.log('Admin user created:', adminUser._id.toString())
    } else {
      console.log('Admin user already exists')
    }
    
    // Create demo course
    const coursesCollection = db.collection('courses')
    const courseExists = await coursesCollection.findOne({ title: 'Curso Demo de Node.js' })
    
    let courseId: ObjectId
    
    if (!courseExists) {
      const course = {
        _id: new ObjectId(),
        title: 'Curso Demo de Node.js',
        description: 'Un curso introductorio a Node.js y Express',
        image: 'https://example.com/nodejs.jpg',
        price: 49.99,
        active: true,
        units: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      await coursesCollection.insertOne(course)
      courseId = course._id
      console.log('Demo course created:', courseId.toString())
    } else {
      courseId = courseExists._id
      console.log('Demo course already exists:', courseId.toString())
    }
    
    // Create demo unit
    const unitsCollection = db.collection('units')
    const unitExists = await unitsCollection.findOne({ 
      title: 'Introducción a Node.js',
      courseId: courseId 
    })
    
    let unitId: ObjectId
    
    if (!unitExists) {
      const unit = {
        _id: new ObjectId(),
        title: 'Introducción a Node.js',
        description: 'Fundamentos básicos de Node.js',
        courseId: courseId,
        order: 0,
        materials: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      await unitsCollection.insertOne(unit)
      unitId = unit._id
      
      // Update course with unit reference
      await coursesCollection.updateOne(
        { _id: courseId },
        { $push: { units: unitId } }
      )
      
      console.log('Demo unit created:', unitId.toString())
    } else {
      unitId = unitExists._id
      console.log('Demo unit already exists:', unitId.toString())
    }
    
    // Create demo material
    const materialsCollection = db.collection('materials')
    const materialExists = await materialsCollection.findOne({
      title: 'Introducción al curso',
      unitId: unitId
    })
    
    if (!materialExists) {
      const material = {
        _id: new ObjectId(),
        title: 'Introducción al curso',
        description: 'Video introductorio al curso de Node.js',
        unitId: unitId,
        type: 'VIDEO',
        key: 'videos/intro.mp4',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      await materialsCollection.insertOne(material)
      
      // Update unit with material reference
      await unitsCollection.updateOne(
        { _id: unitId },
        { $push: { materials: material._id } }
      )
      
      console.log('Demo material created:', material._id.toString())
    } else {
      console.log('Demo material already exists:', materialExists._id.toString())
    }
    
    // Create test user
    const testUserExists = await usersCollection.findOne({ email: 'user@example.com' })
    
    let userId: ObjectId
    
    if (!testUserExists) {
      const hashedPassword = await bcrypt.hash('user123', 10)
      const testUser = {
        _id: new ObjectId(),
        email: 'user@example.com',
        password: hashedPassword,
        name: 'Test User',
        roles: ['USER'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      await usersCollection.insertOne(testUser)
      userId = testUser._id
      console.log('Test user created:', userId.toString())
    } else {
      userId = testUserExists._id
      console.log('Test user already exists:', userId.toString())
    }
    
    // Create enrollment for test user
    const enrollmentsCollection = db.collection('enrollments')
    const enrollmentExists = await enrollmentsCollection.findOne({
      userId: userId,
      courseId: courseId
    })
    
    if (!enrollmentExists) {
      const enrollment = {
        _id: new ObjectId(),
        userId: userId,
        courseId: courseId,
        status: 'ACTIVE',
        activatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      await enrollmentsCollection.insertOne(enrollment)
      console.log('Demo enrollment created:', enrollment._id.toString())
    } else {
      console.log('Demo enrollment already exists:', enrollmentExists._id.toString())
    }
    
    console.log('Seed completed successfully!')
  } catch (error) {
    console.error('Error during seed process:', error)
  } finally {
    await client.close()
    console.log('MongoDB connection closed')
  }
}

// Run the seed function
seed().catch(console.error)
