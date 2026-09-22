# Automated Inventory Issuance and Tracking System

**TITLE**: Automated Inventory Issuance and Tracking System
**SUBJECT**: Senior Design Project-1
**SUBJECT CODE**: CS-414
**SUBMITTED BY**: MIAN M SOHAIL
**REG. NO**: 872-FOC/BSIT/F22
**SUBMITTED TO**: THE COMMITTEE OF DCS
**PROPOSED SUPERVISOR**:
**DATE**: 2026-06-27

## International Islamic University Islamabad
### BS Information and Technology

## Introduction
In large-scale educational institutions like IIUI, managing physical assets (laptops, office equipment, furniture) issued to faculty is a complex task. Currently, these records are often maintained manually, making it difficult to track items across different departments. This project proposes a web-based and mobile integrated Automated Issuance and Inventory Tracking System to digitize the lifecycle of university assets from procurement to recovery.

## Problem Statement
The manual management of university assets leads to several operational inefficiencies:
*   **Difficulty in Asset Recovery**: Tracking items issued to visiting faculty is challenging once their contracts expire.
*   **Inaccurate Record Keeping**: Manual ledgers are prone to human error, loss, and are difficult to search during audits.
*   **Delayed Clearance Process**: The "No Demand Certificate" (NDC) process is slowed down by the need to manually verify asset returns.
*   **Lack of Real-time Visibility**: Store managers cannot instantly see the current status (Issued, Available, Damaged) of inventory items.

## Project Objectives
*   To develop a centralized digital database for all university assets.
*   To categorize faculty (Permanent vs. Visiting) and link their profiles to issued items.
*   To automate the issuance and return process with digital timestamps.
*   To provide automated alerts for assets due for return based on contract end dates.
*   To streamline the clearance (NDC) process through automated status reporting.

## Scope of the Project
*   **Web Portal (Admin/Manager)**: For adding new inventory, managing supplier records, and generating university-wide reports.
*   **Mobile Application (Faculty/Staff)**: To allow faculty to view their issued items, receive return notifications, and request clearance digitally.
*   **QR/Barcode Integration**: To allow quick scanning of assets using a mobile device for instant verification.
*   **Inventory Status Tracking**: Monitoring assets as New, Used, or Damaged.

## Tools & Technologies
*   **Frontend**: HTML, Tailwind CSS, JavaScript, React
*   **Backend**: Node.js with Express.js
*   **Database**: PostgreSQL
*   **Development Tools**: GitHub, Postman

## Proposed Intelligent Feature: (Smart Clearance Prediction)
The system will include a predictive alert module that monitors faculty contract dates. For visiting faculty, the system will automatically trigger a "Pending Asset Alert" to the admin 15 days prior to the contract expiration. This ensures that the recovery process begins early, preventing the loss of university property before the faculty member leaves the premises.

## System Architecture
The system utilizes a Three-Tier Architecture:
*   **Presentation Layer**: Responsive web dashboard and mobile app UI.
*   **Application Layer**: Node.js server handling business logic for both web and mobile platforms.
*   **Data Layer**: A centralized PostgreSQL database storing all relational data.

## Conclusion
This system provides a practical solution to a specific problem faced by university administration. By digitizing the asset tracking process, IIUI can ensure better accountability, reduce financial losses, and provide a faster, more transparent clearance process for its faculty members.
