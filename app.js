import { Console } from "node:console";
import fs from "node:fs";
import { createInterface } from "node:readline";


const reservations = [];
let flights = [];
let seats = [];
let nextId = 1;
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function pickRandomItems(array, count) {
  const copy = [...array];
  const selected = [];

  while (selected.length < count && copy.length > 0) {
    const randomIndex = Math.floor(Math.random() * copy.length);
    const item = copy.splice(randomIndex, 1)[0];
    selected.push(item);
  }

  return selected;
}

function showMainMenu() {
  console.log("\n=== Flight Reservation Menu ===");
  console.log("1. Create Reservation");
  console.log("2. View Reservations");
  console.log("3. Update a reservation");
  console.log("4. Cancel a reservation");
  console.log("5. Exit");
  console.log("===============================");
}


async function main() {
  savedData()
  showMainMenu();
  const choice = await ask("Choose an option (1-4): ");

  switch (choice) {
    case "1":
      await createReservation();
      break;
    case "2":
      viewReservations();
      break;
    case "3":
      updateReservation()
      return;
    case "4":
      cancelReservation()
      return;
    case "5":
      console.log("Goodbye!");
      savedData();
      rl.close();
      return;
      default:
        console.log("Invalid option. Please enter a number between 1 and 5.");
  }
  
  main();
}

async function createReservation() {
  console.log("\n=== Create New Reservation ===");
  const name = await ask("Passenger name: ");
  const randomFlights = pickRandomItems(flights, 3);
  console.log("\nAvailable Flights:");
  randomFlights.forEach((flight, i) =>
    console.log(`${i + 1}. ${flight}`)
);
const flightChoice = await ask("Choose flight (1-3): ");
const flight = randomFlights[parseInt(flightChoice) - 1];
const date = await ask("Flight date (YYYY-MM-DD): ");

const randomSeats = pickRandomItems(seats, 3);
console.log("\nAvailable Seats:");
randomSeats.forEach((seat, i) =>
  console.log(`${i + 1}. ${seat}`)
);

const seatChoice = await ask("Choose seat (1-3): ");
const seat = randomSeats[parseInt(seatChoice) - 1];

const conflict = reservations.find(
  (r) => r.date === date && r.seat === seat
);

if (conflict) {
  console.log("\n This seat is already reserved on this date.");
  console.log("Please choose again.\n");
  return createReservation();
}

const reservation = {
  id: nextId++,
  name,
  flight,
  date,
  seat,
};
reservations.push(reservation);

console.log("\n Reservation Created:");
console.log(reservation);

const again = await ask("\nAdd another reservation? (Y/N): ");
if (again.trim().toUpperCase() === "Y") {
  await createReservation();
}
await ask("\nPress any key to return main menu")
main()
}

function viewReservations() {
  console.log("\n=== All Reservations ===");
  if (reservations.length === 0) {
    console.log("No reservations found.");
    return;
  }
  
  console.log("ID | Name | Flight | Date | Seat");
  console.log("--------------------------------------");
  
  reservations.forEach((r) => {
    console.log(`${r.id} | ${r.name} | ${r.flight} | ${r.date} | ${r.seat}`);
  });
}

fs.readFile("seats.txt", "utf8", (err, data) => {
  if (err) {
    console.error("Could not read file:", err);
    process.exit(1);
  }
  const lines = data
  .split("\n")
  .map((line) => line.trim())
  
  const seatsIndex = lines.indexOf("Seats:");
  
  flights = lines.slice(1, seatsIndex);
  seats = lines.slice(seatsIndex + 1);
  
  console.log("Flights and seats loaded successfully.\n");
  main();
});

async function updateReservation(){
 console.log("\n===== UPDATE RESERVATION =====");
  let id = await ask("Enter reservation id to update: ");
  let reserve = reservations.find((e) => e.id == id);
  if (!reserve) {
    console.log(`Reservation with ID ${id} not found.`);
    updateReservation()
    return;
  }
  reserve.name = await ask("Enter new reservation name: ");
  console.log("Updated:", reserve);
   await ask("\nPress any key to return to main menu");
  main();
}
async function cancelReservation() {
  console.log("\n===== DELETE RESERVATION =====");
  let id = await ask("Enter reservation id to delete: ");
  let reserve = reservations.find((e) => e.id == id);
  if (!reserve) {
    console.log(`Reservation with ID ${id} not found.`);
    cancelReservation()
    return;
  }
  let found = await ask('Select option "Cancelled" and save (c/s): ');
  if (found.toUpperCase() === "C") {
    const index = reservations.indexOf(reserve);
    if (index !== -1) {
      reservations.splice(index, 1);
      console.log("Deleted:", reserve);
      fs.truncate('reservation.txt', 0, function(){console.log('done')})
      savedData()
    }
  } else if (found.toUpperCase() === "S") {
    console.log("Saved (no deletion).");
  }
  await ask("\nPress any key to return to main menu");
  main();
}


function savedData(){
  let data = ""
  reservations.forEach((item) => {
    data += `\n${item.id} | ${item.name} | ${item.flight} | ${item.date} | ${item.seat}`;
  });
   
  fs.writeFileSync("reservation.txt" , data , (err) => {
    if(err) console.log(err);
    console.log("successfully saved data!")
  })
}