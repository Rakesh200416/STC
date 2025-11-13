const mongoose = require('mongoose');
const Test = require('./models/Test');
const Submission = require('./models/Submission');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stc-database', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const checkMentorSubmissions = async () => {
  try {
    console.log('Checking mentor submissions...\n');
    
    // Find all mentors
    const mentors = await User.find({ role: 'mentor' });
    console.log(`Found ${mentors.length} mentors\n`);
    
    for (const mentor of mentors) {
      console.log(`Checking submissions for mentor: ${mentor.name} (${mentor.email})`);
      
      // Find tests created by this mentor
      const tests = await Test.find({ createdBy: mentor._id });
      console.log(`  Found ${tests.length} tests created by this mentor`);
      
      if (tests.length > 0) {
        const testIds = tests.map(test => test._id);
        console.log(`  Test IDs: ${testIds.join(', ')}`);
        
        // Find submissions for these tests
        const submissions = await Submission.find({ testId: { $in: testIds } })
          .populate('userId', 'name email')
          .populate('testId', 'name');
          
        console.log(`  Found ${submissions.length} submissions for these tests`);
        
        if (submissions.length > 0) {
          submissions.forEach((submission, index) => {
            console.log(`    ${index + 1}. Student: ${submission.userId?.name || 'Unknown'} (${submission.userId?.email || 'Unknown'})`);
            console.log(`       Test: ${submission.testId?.name || 'Unknown'}`);
            console.log(`       Score: ${submission.obtainedMarks || 0} marks`);
            console.log(`       Submitted: ${submission.submittedAt || 'Unknown'}`);
            console.log('----------------------------------------');
          });
        }
      } else {
        console.log('  No tests found for this mentor');
      }
      console.log('\n');
    }
    
    // Also check for any orphaned submissions (submissions without matching tests)
    console.log('Checking for orphaned submissions...');
    const allSubmissions = await Submission.find();
    let orphanedCount = 0;
    
    for (const submission of allSubmissions) {
      const test = await Test.findById(submission.testId);
      if (!test) {
        console.log(`  Orphaned submission: ${submission._id} for test ${submission.testId}`);
        orphanedCount++;
      }
    }
    
    console.log(`Found ${orphanedCount} orphaned submissions\n`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
};

checkMentorSubmissions();