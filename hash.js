import bcrypt from "bcryptjs";

const password = "Admin1234"; // your admin password
const saltRounds = 10;

bcrypt.hash(password, saltRounds).then((hash) => {
  console.log("Generated Hash:", hash);
});