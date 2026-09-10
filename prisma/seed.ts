import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding IIIT-Naya Raipur BorrowBuddy database...');

  // Clear existing
  await prisma.dispute.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();
  await prisma.platformConfig.deleteMany();

  // Create Platform Config
  await prisma.platformConfig.create({
    data: {
      id: 'global',
      penaltyRateDaily: 0.05, // 5% per day
      penaltyMaxPercent: 0.50, // max 50%
      simulatedTimeOffsetHours: 0,
    },
  });

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 1. Create Users
  const arjun = await prisma.user.create({
    data: {
      studentId: 'IIITNR-2026-001',
      name: 'Arjun Mehta',
      email: 'arjun@iiitnr.edu.in',
      passwordHash,
      branch: 'DSAI',
      year: '1st Year',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      rating: 4.8,
      reliabilityScore: 97.0,
      role: 'STUDENT',
    },
  });

  const priya = await prisma.user.create({
    data: {
      studentId: 'IIITNR-2025-014',
      name: 'Priya Sharma',
      email: 'priya@iiitnr.edu.in',
      passwordHash,
      branch: 'CSE',
      year: '2nd Year',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      rating: 4.9,
      reliabilityScore: 100.0,
      role: 'STUDENT',
    },
  });

  const rohan = await prisma.user.create({
    data: {
      studentId: 'IIITNR-2024-089',
      name: 'Rohan Verma',
      email: 'rohan@iiitnr.edu.in',
      passwordHash,
      branch: 'ECE',
      year: '3rd Year',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      rating: 4.6,
      reliabilityScore: 92.0,
      role: 'STUDENT',
    },
  });

  const ananya = await prisma.user.create({
    data: {
      studentId: 'IIITNR-2026-045',
      name: 'Ananya Roy',
      email: 'ananya@iiitnr.edu.in',
      passwordHash,
      branch: 'DSAI',
      year: '1st Year',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      rating: 5.0,
      reliabilityScore: 100.0,
      role: 'STUDENT',
    },
  });

  const admin = await prisma.user.create({
    data: {
      studentId: 'IIITNR-FAC-001',
      name: 'Dr. S. K. Verma (Admin)',
      email: 'admin@iiitnr.edu.in',
      passwordHash: adminPasswordHash,
      branch: 'Administration',
      year: 'Faculty In-Charge',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      rating: 5.0,
      reliabilityScore: 100.0,
      role: 'ADMIN',
    },
  });

  console.log('Created students & admin.');

  // 2. Create Campus Items
  // Calculator owned by Priya
  const calculator = await prisma.item.create({
    data: {
      ownerId: priya.id,
      name: 'Casio FX-991ES Plus Scientific Calculator',
      category: 'Academic Equipment',
      description: 'Standard 417 functions scientific calculator, ideal for Engineering Mathematics, Calculus, and Data Science exams. Fully functional with solar cell and battery.',
      imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
      condition: 'Good',
      mode: 'BORROW',
      rentalPrice: 0,
      declaredValue: 1000.0,
      securityDeposit: 0,
      maxDuration: 7,
      availability: 'AVAILABLE',
      campusLocation: 'Hostel Bose Block A, Common Room',
    },
  });

  // Arduino Kit owned by Rohan
  const arduino = await prisma.item.create({
    data: {
      ownerId: rohan.id,
      name: 'Arduino Uno Complete Sensor Starter Kit',
      category: 'Project Equipment',
      description: 'Includes original Arduino Uno R3, breadboard, ultrasonic sensor, DHT11, servo motor, jumper wires, and LCD display. Great for IoT lab assignments.',
      imageUrl: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600&auto=format&fit=crop&q=80',
      condition: 'Like New',
      mode: 'BORROW',
      rentalPrice: 0,
      declaredValue: 2500.0,
      securityDeposit: 0,
      maxDuration: 14,
      availability: 'AVAILABLE',
      campusLocation: 'ECE Hardware Lab / Ramanujan Block B',
    },
  });

  // Dell Charger owned by Arjun
  const charger = await prisma.item.create({
    data: {
      ownerId: arjun.id,
      name: 'Dell 65W USB-C Laptop Charger',
      category: 'Electronics',
      description: 'Original Dell 65W Type-C adapter. Compatible with Dell XPS, Inspiron, Lenovo ThinkPad, HP Spectre, and MacBooks supporting USB-PD.',
      imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
      condition: 'Good',
      mode: 'BORROW',
      rentalPrice: 0,
      declaredValue: 2200.0,
      securityDeposit: 0,
      maxDuration: 3,
      availability: 'AVAILABLE',
      campusLocation: 'Hostel Ramanujan Ground Floor Study Hall',
    },
  });

  // Badminton Rackets owned by Priya
  const badminton = await prisma.item.create({
    data: {
      ownerId: priya.id,
      name: 'Yonex Carbonex Badminton Racket + Shuttles',
      category: 'Sports',
      description: 'Pair of lightweight Yonex graphite rackets with 3 nylon shuttles and padded carry bag. Perfect for evening play at the campus sports arena.',
      imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
      condition: 'Like New',
      mode: 'BOTH',
      rentalPrice: 20.0,
      declaredValue: 1800.0,
      securityDeposit: 100.0,
      maxDuration: 4,
      availability: 'AVAILABLE',
      campusLocation: 'IIIT-NR Sports Complex Court 1',
    },
  });

  // Physics Book owned by Rohan
  const physicsBook = await prisma.item.create({
    data: {
      ownerId: rohan.id,
      name: 'Principles of Physics by Halliday, Resnick & Walker',
      category: 'Books',
      description: '10th Edition Extended textbook. Clean pages, no heavy markings. Essential reference for 1st Year Engineering Physics coursework.',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      condition: 'Good',
      mode: 'BORROW',
      rentalPrice: 0,
      declaredValue: 1200.0,
      securityDeposit: 0,
      maxDuration: 21,
      availability: 'AVAILABLE',
      campusLocation: 'Central Library Main Entrance',
    },
  });

  // Bicycle owned by Ananya
  const cycle = await prisma.item.create({
    data: {
      ownerId: ananya.id,
      name: 'Hercules Roadeo 21-Speed Geared Bicycle',
      category: 'Daily-use Items',
      description: 'Smooth 21-speed Shimano gears, disc brakes, front suspension, and numeric combination lock included. Great for going to campus gate or city center.',
      imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80',
      condition: 'Good',
      mode: 'RENT',
      rentalPrice: 30.0,
      declaredValue: 8500.0,
      securityDeposit: 200.0,
      maxDuration: 7,
      availability: 'AVAILABLE',
      campusLocation: 'Hostel Ramanujan Cycle Stand',
    },
  });

  // HDMI Adapter owned by Priya
  const hdmiAdapter = await prisma.item.create({
    data: {
      ownerId: priya.id,
      name: 'USB-C to 4K HDMI Presentation Adapter',
      category: 'Electronics',
      description: 'Aluminum USB-C to HDMI cable adapter, supports 4K 60Hz. Crucial for classroom presentations, seminars in LT-1 and LT-2, and lab screens.',
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
      condition: 'Brand New',
      mode: 'BORROW',
      rentalPrice: 0,
      declaredValue: 1400.0,
      securityDeposit: 0,
      maxDuration: 2,
      availability: 'AVAILABLE',
      campusLocation: 'Hostel Bose B-302 / Admin Block',
    },
  });

  // Soldering Kit owned by Rohan
  const solderingKit = await prisma.item.create({
    data: {
      ownerId: rohan.id,
      name: 'Digital Multimeter & Soldering Iron Station',
      category: 'Academic Equipment',
      description: '60W adjustable temperature soldering iron, solder flux, stand, desoldering pump, and autoranging digital multimeter with probes.',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
      condition: 'Good',
      mode: 'BORROW',
      rentalPrice: 0,
      declaredValue: 1900.0,
      securityDeposit: 0,
      maxDuration: 5,
      availability: 'AVAILABLE',
      campusLocation: 'Hardware Workshop / Robotics Club Room',
    },
  });

  console.log('Created campus listings.');

  // 3. Create Sample Completed Transaction with Ratings
  const pastTx = await prisma.transaction.create({
    data: {
      itemId: physicsBook.id,
      ownerId: rohan.id,
      borrowerId: arjun.id,
      requestDate: new Date(Date.now() - 15 * 86400000),
      approvalDate: new Date(Date.now() - 15 * 86400000 + 3600000),
      startDate: new Date(Date.now() - 15 * 86400000 + 7200000),
      deadline: new Date(Date.now() - 5 * 86400000),
      actualReturnDate: new Date(Date.now() - 6 * 86400000),
      mode: 'BORROW',
      status: 'RETURNED',
      borrowerNotes: 'Needed for Physics Mid-Semester exam preparation.',
    },
  });

  await prisma.rating.create({
    data: {
      transactionId: pastTx.id,
      reviewerId: rohan.id,
      revieweeId: arjun.id,
      rating: 5,
      comment: 'Arjun returned the textbook a day before deadline in pristine condition! Highly trustworthy borrower.',
      criteria: 'On-time, Excellent Condition, Polite',
    },
  });

  await prisma.rating.create({
    data: {
      transactionId: pastTx.id,
      reviewerId: arjun.id,
      revieweeId: rohan.id,
      rating: 5,
      comment: 'Rohan was super helpful, handed over the book at Central Library within 10 minutes of approval.',
      criteria: 'Quick Handover, Friendly, Recommended',
    },
  });

  // 4. Initial welcome notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: arjun.id,
        title: 'Welcome to BorrowBuddy IIIT-NR!',
        message: 'Your institutional profile has been verified for IIIT-NR. Start exploring or listing items.',
        type: 'SYSTEM',
      },
      {
        userId: priya.id,
        title: 'Welcome to BorrowBuddy IIIT-NR!',
        message: 'Your Casio Calculator is live and available for borrowing by peers on BorrowBuddy.',
        type: 'SYSTEM',
      },
      {
        userId: rohan.id,
        title: 'Welcome to BorrowBuddy IIIT-NR!',
        message: 'You have 3 active campus listings in Academic & Project equipment.',
        type: 'SYSTEM',
      },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
