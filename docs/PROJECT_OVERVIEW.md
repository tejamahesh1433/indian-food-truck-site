# Project Overview

## Project Title

Indian Food Truck Management System

## Problem Statement

Food trucks often rely on manual methods for managing menu updates, catering requests, order taking, and truck location announcements. This creates inefficiencies, poor customer communication, and missed revenue from customers who want to order but cannot reach the truck.

This system provides a centralized digital platform to manage all operations efficiently — from discovery and online ordering to payment, fulfillment, and catering logistics.

---

## Objectives

* Provide a digital menu for customers with real-time availability
* Enable customers to place and pay for orders directly online via Stripe
* Give customers visibility into their order status via a dedicated tracking page
* Enable customers to request catering services with a professional item selection flow
* Allow the owner to manage food truck operations from a single dashboard
* Provide real-time truck location and schedule updates
* Support user accounts so repeat customers can log in and view order history
* Send automated transactional emails to both customers and admin on key events (order paid, catering request received)
* Offer an easy-to-use administrative interface with secure authentication

---

## Target Users

### Customers

People looking to:

* Browse the full menu with dietary filters (Veg, Spicy, Popular)
* Add items to cart and pay securely online
* Track their active order and chat with the truck owner
* Locate the truck for walk-up orders
* Request catering for events
* Create an account to save and review order history

### Owner / Admin

Responsible for:

* Receiving and managing incoming orders (update status, chat with customer)
* Managing menu items, prices, and availability
* Responding to catering requests
* Updating the truck's daily and upcoming schedule
* Configuring site settings, branding, and feature toggles
* Receiving admin notification emails for new paid orders

---

## System Scope

### Customer Interface

* Homepage — truck status, featured dishes, location, and Instagram feed
* Menu page — full menu with category tabs and add-to-cart
* Checkout page — Stripe-powered secure payment
* Order success page — confirmation and next steps
* Order tracking page — live status with customer-admin chat
* Catering page — professional item selection with tray configuration
* Catering chat page — direct messaging with the owner via unique token
* Authentication pages — sign up, log in, profile with order history
* Privacy policy page

### Admin Interface

* Secure login with database-backed rate limiting and JWT auth
* Orders dashboard — view all paid orders, update statuses, chat with customers
* Menu management — full CRUD, availability toggles, drag-to-reorder
* Catering inbox — status tracking (NEW → CONTACTED → DONE), messaging
* Schedule manager — today/next stop, hours, notes, saved locations
* Site settings — branding, banner, PIN gate, catering toggle, public email
* Catering menu management — items and categories with pricing tiers
