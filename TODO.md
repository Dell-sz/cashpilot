# TODO: Restructure Firestore to User-Scoped Subcollections

## Overview

Restructure the Firestore database to use subcollections under `users/{userId}` for transactions, fixed_expenses, and categories. Update all CRUD operations to use the current user's UID and add authentication checks to redirect unauthenticated users.

## Steps

- [ ] Update Dashboard.js: Change collection references to user subcollections and add auth redirect
- [ ] Update Transactions.js: Change collection references to user subcollections and add auth redirect
- [ ] Update FixedExpenses.js: Change collection references to user subcollections and add auth redirect
- [ ] Update Categories.js: Change collection references to user subcollections and add auth redirect
- [ ] Check and update Reports.js if needed
- [ ] Test the application to ensure data isolation per user
