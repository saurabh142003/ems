import mongoose from "mongoose";
import dotenv from "dotenv";
import Employee from "../models/employee.model";

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ems";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await Employee.deleteMany({});
    console.log("Cleared existing employees.");

    // 1. Create Super Admin
    const superAdmin = await Employee.create({
      employeeId: "EMP-1001",
      name: "Saurabh Mishra",
      email: "saurabh.admin@ems.com",
      phone: "9876543210",
      password: "password123", // Will be hashed by pre-save hook
      role: "Super Admin",
      department: "Executive",
      designation: "Chief Executive Officer",
      salary: 250000,
      joiningDate: new Date("2024-01-01"),
      status: "Active",
      manager: null,
      profileImage:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
    });
    console.log("Super Admin seeded successfully.");

    // 2. Create 2 HR Managers
    const hr1 = await Employee.create({
      employeeId: "EMP-1002",
      name: "Rohan Sharma",
      email: "rohan.hr@ems.com",
      phone: "9876543211",
      password: "password123",
      role: "HR Manager",
      department: "Human Resources",
      designation: "HR Lead",
      salary: 95000,
      joiningDate: new Date("2024-06-15"),
      status: "Active",
      manager: superAdmin._id,
      profileImage:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    });

    const hr2 = await Employee.create({
      employeeId: "EMP-1003",
      name: "Priya Patel",
      email: "priya.hr@ems.com",
      phone: "9876543212",
      password: "password123",
      role: "HR Manager",
      department: "Human Resources",
      designation: "Talent Acquisition Manager",
      salary: 90000,
      joiningDate: new Date("2024-09-01"),
      status: "Active",
      manager: superAdmin._id,
      profileImage:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
    });
    console.log("2 HR Managers seeded successfully.");

    // 3. Create 15 Employees
    const departments = [
      "Engineering",
      "Marketing",
      "Sales",
      "Finance",
      "Design",
    ];
    const designations = {
      Engineering: [
        "Senior Software Engineer",
        "Software Engineer",
        "QA Engineer",
        "DevOps Engineer",
      ],
      Marketing: [
        "Marketing Specialist",
        "SEO Analyst",
        "Social Media Manager",
      ],
      Sales: [
        "Account Executive",
        "Sales Representative",
        "Business Development Manager",
      ],
      Finance: ["Financial Analyst", "Senior Accountant"],
      Design: ["UI/UX Designer", "Product Designer"],
    };

    const employeeNames = [
      {
        name: "Amit Verma",
        email: "amit.eng@ems.com",
        dept: "Engineering",
        desig: "Senior Software Engineer",
        salary: 120000,
        mgr: superAdmin._id,
      },
      {
        name: "Sneha Rao",
        email: "sneha.eng@ems.com",
        dept: "Engineering",
        desig: "Software Engineer",
        salary: 85000,
        mgr: superAdmin._id,
      },
      {
        name: "Vikram Singh",
        email: "vikram.eng@ems.com",
        dept: "Engineering",
        desig: "QA Engineer",
        salary: 70000,
        mgr: superAdmin._id,
      },
      {
        name: "Ananya Iyer",
        email: "ananya.eng@ems.com",
        dept: "Engineering",
        desig: "DevOps Engineer",
        salary: 110000,
        mgr: superAdmin._id,
      },

      {
        name: "Rahul Gupta",
        email: "rahul.mkt@ems.com",
        dept: "Marketing",
        desig: "Marketing Specialist",
        salary: 65000,
        mgr: hr1._id,
      },
      {
        name: "Meera Nair",
        email: "meera.mkt@ems.com",
        dept: "Marketing",
        desig: "SEO Analyst",
        salary: 60000,
        mgr: hr1._id,
      },
      {
        name: "Karan Malhotra",
        email: "karan.mkt@ems.com",
        dept: "Marketing",
        desig: "Social Media Manager",
        salary: 55000,
        mgr: hr1._id,
      },

      {
        name: "Aditya Sen",
        email: "aditya.sls@ems.com",
        dept: "Sales",
        desig: "Account Executive",
        salary: 80000,
        mgr: hr2._id,
      },
      {
        name: "Neha Joshi",
        email: "neha.sls@ems.com",
        dept: "Sales",
        desig: "Sales Representative",
        salary: 50000,
        mgr: hr2._id,
      },
      {
        name: "Siddharth Roy",
        email: "siddharth.sls@ems.com",
        dept: "Sales",
        desig: "Business Development Manager",
        salary: 85000,
        mgr: hr2._id,
      },

      {
        name: "Divya Sharma",
        email: "divya.fin@ems.com",
        dept: "Finance",
        desig: "Financial Analyst",
        salary: 75000,
        mgr: superAdmin._id,
      },
      {
        name: "Rajesh Kumar",
        email: "rajesh.fin@ems.com",
        dept: "Finance",
        desig: "Senior Accountant",
        salary: 90000,
        mgr: superAdmin._id,
      },

      {
        name: "Tanvi Shah",
        email: "tanvi.dsg@ems.com",
        dept: "Design",
        desig: "UI/UX Designer",
        salary: 80000,
        mgr: hr1._id,
      },
      {
        name: "Abhishek Bose",
        email: "abhishek.dsg@ems.com",
        dept: "Design",
        desig: "Product Designer",
        salary: 95000,
        mgr: hr1._id,
      },
      {
        name: "Kriti Saxena",
        email: "kriti.eng@ems.com",
        dept: "Engineering",
        desig: "Software Engineer",
        salary: 82000,
        mgr: superAdmin._id,
      },
    ];

    for (let i = 0; i < employeeNames.length; i++) {
      const empData = employeeNames[i];
      const seqId = 1004 + i;
      await Employee.create({
        employeeId: `EMP-${seqId}`,
        name: empData.name,
        email: empData.email,
        phone: `9876543${seqId}`,
        password: "password123",
        role: "Employee",
        department: empData.dept,
        designation: empData.desig,
        salary: empData.salary,
        joiningDate: new Date(
          Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000),
        ), // Random date in last year
        status: "Active",
        manager: empData.mgr,
        profileImage: `https://images.unsplash.com/photo-${1500000000000 + seqId}?auto=format&fit=crop&q=80&w=200`,
      });
    }

    console.log("15 Employees seeded successfully.");
    console.log("--------------------------------------------------");
    console.log("SEEDING COMPLETED SUCCESSFULLY!");
    console.log("--------------------------------------------------");
    console.log("Test Credentials:");
    console.log("1. Super Admin:");
    console.log("   Email: saurabh.admin@ems.com");
    console.log("   Password: password123");
    console.log("2. HR Manager 1:");
    console.log("   Email: rohan.hr@ems.com");
    console.log("   Password: password123");
    console.log("3. HR Manager 2:");
    console.log("   Email: priya.hr@ems.com");
    console.log("   Password: password123");
    console.log("4. Standard Employee (Amit Verma):");
    console.log("   Email: amit.eng@ems.com");
    console.log("   Password: password123");
    console.log("--------------------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
