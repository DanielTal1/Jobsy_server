
class JobSet extends Set {
    has(job) {
        console.log("in has");
        for (let item of this) {
          if (item.isEqual(job)) {
            return true;
          }
        }
        return false;
      }
}

module.exports = JobSet;