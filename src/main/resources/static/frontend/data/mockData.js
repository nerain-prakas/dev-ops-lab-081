// Mock data for the Course Management System
// Replace these with actual API calls when backend is ready

export const mockUsers = [
    { userId: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'STUDENT', studentId: 101 },
    { userId: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'INSTRUCTOR', employeeId: 201 },
    { userId: 3, name: 'Carol Davis', email: 'carol@example.com', role: 'STUDENT', studentId: 102 },
    { userId: 4, name: 'David Wilson', email: 'david@example.com', role: 'ADMIN', adminLevel: 'SUPER' },
    { userId: 5, name: 'Eve Martinez', email: 'eve@example.com', role: 'INSTRUCTOR', employeeId: 202 },
    { userId: 6, name: 'Frank Brown', email: 'frank@example.com', role: 'STUDENT', studentId: 103 },
    { userId: 7, name: 'Grace Lee', email: 'grace@example.com', role: 'STUDENT', studentId: 104 },
    { userId: 8, name: 'Henry Taylor', email: 'henry@example.com', role: 'INSTRUCTOR', employeeId: 203 },
];

export const mockCourses = [
    { courseId: 1, title: 'Data Structures & Algorithms', fee: 4999, totalSeats: 60, instructor: 'Bob Smith', enrolledCount: 42, color: 'blue' },
    { courseId: 2, title: 'Web Development with React', fee: 3999, totalSeats: 45, instructor: 'Eve Martinez', enrolledCount: 38, color: 'purple' },
    { courseId: 3, title: 'Machine Learning Fundamentals', fee: 5999, totalSeats: 40, instructor: 'Bob Smith', enrolledCount: 35, color: 'emerald' },
    { courseId: 4, title: 'Database Management Systems', fee: 3499, totalSeats: 50, instructor: 'Henry Taylor', enrolledCount: 28, color: 'amber' },
    { courseId: 5, title: 'Cloud Computing & DevOps', fee: 4499, totalSeats: 35, instructor: 'Eve Martinez', enrolledCount: 30, color: 'cyan' },
    { courseId: 6, title: 'Mobile App Development', fee: 4299, totalSeats: 40, instructor: 'Henry Taylor', enrolledCount: 22, color: 'rose' },
];

export const mockEnrollments = [
    { enrollmentId: 1, studentName: 'Alice Johnson', courseName: 'Data Structures & Algorithms', status: 'ACTIVE', enrollmentDate: '2025-01-15' },
    { enrollmentId: 2, studentName: 'Carol Davis', courseName: 'Web Development with React', status: 'ACTIVE', enrollmentDate: '2025-01-20' },
    { enrollmentId: 3, studentName: 'Frank Brown', courseName: 'Machine Learning Fundamentals', status: 'COMPLETED', enrollmentDate: '2024-08-10' },
    { enrollmentId: 4, studentName: 'Grace Lee', courseName: 'Database Management Systems', status: 'ACTIVE', enrollmentDate: '2025-02-01' },
    { enrollmentId: 5, studentName: 'Alice Johnson', courseName: 'Cloud Computing & DevOps', status: 'DROPPED', enrollmentDate: '2024-11-05' },
    { enrollmentId: 6, studentName: 'Carol Davis', courseName: 'Data Structures & Algorithms', status: 'ACTIVE', enrollmentDate: '2025-02-10' },
    { enrollmentId: 7, studentName: 'Grace Lee', courseName: 'Web Development with React', status: 'ACTIVE', enrollmentDate: '2025-02-15' },
];

export const mockReservations = [
    { reservationId: 1, courseName: 'Data Structures & Algorithms', status: 'CONFIRMED', expiryDate: '2025-04-15' },
    { reservationId: 2, courseName: 'Machine Learning Fundamentals', status: 'PENDING', expiryDate: '2025-03-20' },
    { reservationId: 3, courseName: 'Mobile App Development', status: 'CONFIRMED', expiryDate: '2025-05-01' },
    { reservationId: 4, courseName: 'Cloud Computing & DevOps', status: 'CANCELLED', expiryDate: '2025-02-28' },
    { reservationId: 5, courseName: 'Web Development with React', status: 'CONFIRMED', expiryDate: '2025-04-30' },
];

export const mockPayments = [
    { paymentId: 1, amount: 4999, paymentDate: '2025-01-15', transactionStatus: 'SUCCESS', courseName: 'Data Structures & Algorithms', studentName: 'Alice Johnson' },
    { paymentId: 2, amount: 3999, paymentDate: '2025-01-20', transactionStatus: 'SUCCESS', courseName: 'Web Development with React', studentName: 'Carol Davis' },
    { paymentId: 3, amount: 5999, paymentDate: '2024-08-10', transactionStatus: 'SUCCESS', courseName: 'Machine Learning Fundamentals', studentName: 'Frank Brown' },
    { paymentId: 4, amount: 3499, paymentDate: '2025-02-01', transactionStatus: 'PENDING', courseName: 'Database Management Systems', studentName: 'Grace Lee' },
    { paymentId: 5, amount: 4499, paymentDate: '2024-11-05', transactionStatus: 'FAILED', courseName: 'Cloud Computing & DevOps', studentName: 'Alice Johnson' },
    { paymentId: 6, amount: 4999, paymentDate: '2025-02-10', transactionStatus: 'SUCCESS', courseName: 'Data Structures & Algorithms', studentName: 'Carol Davis' },
];
