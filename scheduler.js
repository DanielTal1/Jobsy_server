const cron = require('node-cron');
const Job = require('./models/jobs-modle');

//schedule the task to run every day at 2 am.
cron.schedule('00 02 * * *', async () => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    //finding jobs that haven't been updated for a month
    const jobsToArchive = await Job.find({
      last_updated: { $lt: oneMonthAgo },
      archive: false,
    });

    //set the archive attribute of those jobs to true
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

//keeps the script running
process.stdin.resume();
