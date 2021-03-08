This a E-Commerce Website made using node.js with ejs view engine.

This Website is hosted on Heroku at following link:
=> https://node-shop-nitin1rajput.herokuapp.com/

Also you can raise an issue or clone it to your PC.

Following are the teps to run this on your PC

Step-1: Clone the repo to your local machine.

Step-2: run command (npm install) to install all the dependencies

Step-3: In .env_sample file Change SAMPLE To your link,API-keys etc.
DB_URI=SAMPLE
MAILGUN_API=SAMPLE
MAILGUN_DOMAIN=SAMPLE
STRIPE_API=SAMPLE
BACKEND_URL=SAMPLE

Step-4(Optional): Change line no.8 of package.json file. FROM node => nodemon

Step-5. The above step is optional you if you use nodemon on testing, it will be better. Now after settiing up all thing run command (npm start)

Step-6. If On console it log (connected) the your app is ready to go. Otherwise change it accordingly.

Step-7. Go to browser and type localhost:3000. here 3000 is default port.

\*Note- If you don't want to follow above steps just click on the 1st link, it will lead you to the hosted site.
