const cron = require('node-cron');
const Job = require('./models/jobs-modle');

// Schedule the task to run every day at midnight (0:00)
cron.schedule('00 02 * * *', async () => {
  try {
    const currentDate = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Find jobs that haven't been updated for a month
    const jobsToArchive = await Job.find({
      last_updated: { $lt: oneMonthAgo },
      archive: false,
    });

    // Archive the jobs by setting the "archive" attribute to true
    await Job.updateMany(
      { _id: { $in: jobsToArchive.map((job) => job._id) } },
      { $set: { archive: true } }
    );

    console.log('Archived jobs:', jobsToArchive.length);
  } catch (error) {
    console.error('Error archiving jobs:', error);
  }
});

console.log('Job archive scheduler started.');

// Keep the script running
process.stdin.resume();
