import React, { useState, useEffect } from 'react';

import axiosInstance from '../../api/axiosInstance';

import Footer from './Layouts/Footer';
import Navbar from './Layouts/Navbar';
import Sidebar from './Layouts/Sidebar';

// Consolidated Asset Imports from src/assets/Owner/Attendance/
import total_attendance from '../../assets/Owner/Attendance/total_attendance.svg';
import total_employee from '../../assets/Owner/Attendance/total_employee.svg';
import on_leave from '../../assets/Owner/Attendance/on_leave.svg';
import searchIcon from '../../assets/Owner/Attendance/search.svg';
import customOrder from '../../assets/Owner/Attendance/custom_order.svg';

export default function StaffAttendance() {
    // Mock data matching your screen's UI cards
    const [attendanceData, setAttendanceData] = useState([]);

    const [leaveRequests, setLeaveRequests] = useState([]);

    const approvedCount = leaveRequests.filter(
        item => item.status === "APPROVED"
    ).length;

    const pendingCount = leaveRequests.filter(
        item => item.status === "PENDING"
    ).length;

    const rejectedCount = leaveRequests.filter(
        item => item.status === "REJECTED"
    ).length;
    const [activeTab, setActiveTab] = useState("LEAVE_REQUEST");

    const totalStaffCount =
        [...new Set(attendanceData.map(item => item.staffId))].length;

    const presentStaffCount =
        [...new Set(
            attendanceData
                .filter(item => item.status === "PRESENT")
                .map(item => item.staffId)
        )].length;

    const updateLeaveStatus = async (leaveId, status) => {
        try {
            if (status == "APPROVED") {
                await axiosInstance.post(
                    '/staff-attendance/leave/${leaveId}/approve'
                );
            } else {
                await axiosInstance.post(
                    '/staff-attendance/leave/${leaveId}/reject'
                );
            }
            fetchLeaveRequests();
        } catch (error) {
            console.log(error);
        }
    };

    const fetchLeaveRequests = async () => {
        try {

            const response = await axiosInstance.get("staff-attendance/leave/search", {
                params: {
                    page: 0,
                    size: 50
                }
            });

            console.log(response.data);

            setLeaveRequests(response.data.content);

        } catch (error) {
            console.log(error);
        }
    };

    const approveLeave = async (leaveId) => {
        try {
            await axiosInstance.post(
                `/staff-attendance/leave/${leaveId}/approve`
            );

            fetchLeaveRequests();

        } catch (error) {
            console.log(error);
        }
    };

    const rejectLeave = async (leaveId) => {
        try {
            await axiosInstance.post(
                `/staff-attendance/leave/${leaveId}/reject`
            );

            fetchLeaveRequests();

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchLeaveRequests();
        fetchAttendanceHistory();
    }, []);

    const fetchAttendanceHistory = async () => {
        try {
            const response = await axiosInstance.get(
                "/staff-attendance/search",
                {
                    params: {
                        page: 0,
                        size: 50
                    }
                }
            );

            console.log(response.data);

            setAttendanceData(response.data.content);

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* 1. Global Navigation Bar Header */}
            <Navbar />

            {/* Main Container Layer with Sidebar */}
            <div className="flex flex-1">

                {/* 2. Left Application Sidebar Component */}
                <Sidebar />

                {/* 3. Main Dashboard Window Area */}
                <main className="flex-1 p-8 bg-[#FDFDFD] flex flex-col justify-between">

                    <div>
                        {/* Header Row Title */}
                        <div className="mb-8">
                            <h1 className="text-xl font-bold text-gray-800 mb-5">
                                Employee Attendance
                            </h1>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setActiveTab("LEAVE_REQUEST")}
                                    className={`px-6 py-2 rounded-lg font-medium transition
            ${activeTab === "LEAVE_REQUEST"
                                            ? "bg-orange-500 text-white"
                                            : "bg-white border"
                                        }`}
                                >
                                    Leave Requests
                                </button>

                                <button
                                    onClick={() => setActiveTab("ATTENDANCE")}
                                    className={`px-6 py-2 rounded-lg font-medium transition
            ${activeTab === "ATTENDANCE"
                                            ? "bg-orange-500 text-white"
                                            : "bg-white border"
                                        }`}
                                >
                                    Attendance
                                </button>
                            </div>
                        </div>

                        {
                            activeTab == "ATTENDANCE" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                                    {/* Total Staff */}
                                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                                        <p className="text-gray-500 text-sm">
                                            Total Staff
                                        </p>

                                        <h1 className="text-4xl font-bold text-blue-500 mt-2">
                                            {totalStaffCount}
                                        </h1>
                                    </div>

                                    {/* Present Staff */}
                                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                                        <p className="text-gray-500 text-sm">
                                            Present Staff
                                        </p>

                                        <h1 className="text-4xl font-bold text-green-500 mt-2">
                                            {presentStaffCount}
                                        </h1>
                                    </div>

                                </div>
                            )}

                        {/* Filter & Search Panel Row using Asset Icons */}
                        <div className="bg-[#F8F9FA] rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between border border-gray-100">
                            <div className="relative w-full sm:w-80">
                                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <img src={searchIcon} alt="Search" className="w-4 h-4 text-gray-400" />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search Team Member"
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500"
                                />
                            </div>

                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                                <img src={customOrder} alt="Custom Order" className="w-4 h-4" />
                                <span>Custom Order</span>
                                <span className="text-[10px] text-gray-400 ml-1">▼</span>
                            </button>
                        </div>


                        {
                            activeTab === "LEAVE_REQUEST" ? (

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">

                                    {leaveRequests.map((leave) => (
                                        <div
                                            key={leave.id}
                                            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                                        >

                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-bold text-gray-800">
                                                    Staff ID : {leave.staffId}
                                                </h3>

                                                <div className="flex items-center gap-2">
                                                    {leave.status === "PENDING" ? (
                                                        <>
                                                            <button
                                                                onClick={() => approveLeave(leave.id)}
                                                                className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs"
                                                            >
                                                                Approve
                                                            </button>

                                                            <button
                                                                onClick={() => rejectLeave(leave.id)}
                                                                className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold
                                    ${leave.status === "APPROVED"
                                                                    ? "bg-green-100 text-green-600"
                                                                    : "bg-red-100 text-red-600"
                                                                }`}
                                                        >
                                                            {leave.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">Start Date :</span>{" "}
                                                    {new Date(leave.startDate).toLocaleDateString()}
                                                </div>

                                                <div>
                                                    <span className="font-medium">End Date :</span>{" "}
                                                    {new Date(leave.endDate).toLocaleDateString()}
                                                </div>

                                                <div>
                                                    <span className="font-medium">Reason :</span>{" "}
                                                    {leave.reason}
                                                </div>
                                            </div>

                                        </div>
                                    ))}

                                </div>

                            ) : (

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">

                                    {attendanceData.map((attendance) => (

                                        <div
                                            key={attendance.id}
                                            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                                        >

                                            <h3 className="font-bold text-lg text-gray-800 mb-4">
                                                Staff ID : {attendance.staffId}
                                            </h3>

                                            <div className="space-y-2 text-sm text-gray-600">

                                                <div>
                                                    <span className="font-medium">
                                                        Attendance Date :
                                                    </span>{" "}
                                                    {new Date(attendance.attendanceDate)
                                                        .toLocaleDateString()}
                                                </div>

                                                <div>
                                                    <span className="font-medium">
                                                        Check In :
                                                    </span>{" "}
                                                    {attendance.checkIn}
                                                </div>

                                                <div>
                                                    <span className="font-medium">
                                                        Check Out :
                                                    </span>{" "}
                                                    {attendance.checkOut}
                                                </div>

                                                <div>
                                                    <span className="font-medium">
                                                        Status :
                                                    </span>

                                                    <span
                                                        className={`ml-2 px-2 py-1 rounded-full text-xs
                                ${attendance.status === "PRESENT"
                                                                ? "bg-green-100 text-green-600"
                                                                : attendance.status === "ABSENT"
                                                                    ? "bg-red-100 text-red-600"
                                                                    : "bg-yellow-100 text-yellow-600"
                                                            }`}
                                                    >
                                                        {attendance.status}
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            )
                        }


                    </div>

                    {/* 4. Global Structural Footer Layout Module */}
                    <Footer />

                </main>
            </div>
        </div>
    );
}