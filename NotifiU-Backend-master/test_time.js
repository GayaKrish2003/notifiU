const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: String,
  status: String,
  startTime: Date,
  endTime: Date,
  rsvpList: [{}],
  attendanceList: [{}]
}, { collection: 'events' }); // Adjust strictly if needed

const Event = mongoose.model('Event', EventSchema);

async function check() {
    await mongoose.connect('mongodb://itp:itp@ac-ctdtt3p-shard-00-00.mw5suk3.mongodb.net:27017,ac-ctdtt3p-shard-00-01.mw5suk3.mongodb.net:27017,ac-ctdtt3p-shard-00-02.mw5suk3.mongodb.net:27017/?ssl=true&replicaSet=atlas-lyplrh-shard-0&authSource=admin&appName=Cluster0');
    
    // find upcoming events
    const events = await Event.find({ status: 'Upcoming' });
    const now = new Date();
    
    console.log("Current time:", now);
    
    events.forEach(event => {
        console.log(`\nEvent: ${event.title}`);
        console.log(`Starts at: ${event.startTime}`);
        if(event.startTime) {
            const timeDiff = event.startTime.getTime() - now.getTime();
            const diffMins = Math.floor(timeDiff / 60000);
            console.log(`diffMins: ${diffMins}`);
            
            if (diffMins > 5 && diffMins <= 15) {
                console.log('Would trigger REMINDER');
            } else if (diffMins >= -15 && diffMins <= 5) {
                console.log('Would trigger ATTENDANCE');
            } else {
                console.log('Outside notification window');
            }
        }
    });

    mongoose.disconnect();
}

check().catch(console.error);
