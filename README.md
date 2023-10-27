
<p align="center">  
<img width="100" src="https://www.gramflow.pro/logo.svg">  
<h1 align="center">GramFlow</h1>  
<h4 align="center">Sell at scale on Instagram</h4>  
</p>  
  
GramFlow enables sellers on Instagram to sell at scale. It is a platform that enables sellers to manage their inventory,  
orders, and customers. GramFlow is a SaaS product that is built for the Indian market.  
  
## Problem that GramFlow Solves  
  
Instagram sellers often either have a page on instgram or have a website that they use to sell their products. They  
often use a combination of WhatsApp and Instagram to manage their orders. This is a very inefficient way of managing  
orders and customers. GramFlow solves this problem by providing a platform that enables sellers to manage their  
inventory, orders, and customers all via a single platform i.e. Instagram.  
  
Users just have to upload products to their Instagram pages as they usually do and we manage the rest.  
Here's what we do:  
  
- We automatically create a beautiful Admin Panel for the user where they can manage their inventory, orders, and  
customers.  
- The admin panel has a dashboard that shows the user their sales, orders, and customers. It also includes various  
analytics and visualizes them in the form of graphs.  
- The admin can create orders and pass the link to the customers after the payment.  
- The admin can also create shipments directly on shipping partners like Shiprocket and Delhivery with a single click  
and can even upload bulk CSV files to the dashboards of the same.  
- We handle the notifications to the customer in the form of beautiful emails.  
- We also create a customer facing web-app where the users can submit all details which is secured with OTPs on thier  
emails. The customer data is saved for future orders.  
- We also provide a beautiful customer facing order tracking page where the customers can track their orders.  
- We automatically sync the shipment status from the shipping partners and update the customers via email and SMS.  
- We mirror your instagram page, so in-case instagram is down, you can still view and ship your orders.  
- We automatically create the shipping labels, so that you can just print, paste and ship your orders.
  
> tl;dr: We automate the entire process of selling on Instagram from the ordering to the shipping.  
  
## Who is this for?  
  
GramFlow is a solution designed for Instagram sellers that do not want to use/ do not have access to Instagram's  
E-commerce offerings and do not want to have a E-commerce website since they are expensive and hard to manage, and also  
requires duplication of posts on the website and Instagram.  
  
  
  
<br>  
  
## What is the flow of the order processing?  
  
The processing is quite simple, here are the steps:  
  
1. We sync the instagram posts to our database whenever you add a new post.  
2. After the customer has paid for the product, the admin creates an order on the admin panel.  
3. The admin then sends the order link to the customer.  
4. The customer then fills in the details on the order page and submits the order.  
5. The admin then creates a shipment directly on the dashboard. *We only support Delhivery at the moment.*  
6. The admin then ships the order and the customer is notified via email and SMS.  
  
<h2 align="center">GramFlow Admin</h2>  
<p align="center">  
The GramFlow Admin is a beautiful dashboard that enables sellers to manage their inventory, orders, and customers.  
</p>  
<p align="center">  
<img src="https://gramflow.pro/SCR-20231010-fux.png" width="300">  
<img src="https://gramflow.pro/SCR-20231010-fve.png" width="300">  
<img src="https://gramflow.pro/SCR-20231010-fx0.png" width="300">  
<img src="https://gramflow.pro/SCR-20231010-fxu.jpeg" width="300">  
<img src="https://gramflow.pro/SCR-20231010-fzp.png" width="300">  
<img src="https://gramflow.pro/SCR-20231010-g3o.png" width="300">  
<img src="https://gramflow.pro/SCR-20231010-g4j.png" width="300">  
</p>  
  
<h2 align="center">GramFlow Web (Customer)</h2>  
<p align="center">  
Gramflow Web is a customer facing web-app that enables customers to submit their details and track their orders.  
</p>  
<p align="center">  
  
<img src="https://gramflow.pro/SCR-20231010-gek.png" width="300">  
<img src="https://gramflow.pro/SCR-20231010-gfl.png" width="300">  
<img src="https://gramflow.pro/SCR-20231010-ggq.png" width="300">  
<img src="https://gramflow.pro/SCR-20231010-ghb.png" width="300">  
</p>  
  
## What is our tech stack?  
  
We use the following tech stack:  
  
- NextJS 14(App. Directory) w Typescript  
- Turborepo (Monorepo)  
- PNPM Workspaces (Managing dependencies and packages within the monorepo)
- Tailwind CSS  
- NextJS API Routes  
- Trigger.dev (Scheduled Jobs and database Backups)  
- Clouflare R2 (S3 alternative to store images and files)  
- Prisma (Database ORM)  
- Supabase (Postgres- Database)  
- Shadcn UI  
- Doppler (Environment Variables and Secret Management)  
- Resend (Emails)  
- Clerk.dev (Authentication for Admin Panel)  
- Tremor (Dashboard's Visual Analytics)  
- AWS S3 SDK  
- Upstash Redis (Syncing Instagram Posts)  
- Jest (Testing [Coming soon])  
- React Hook Form (Complex Forms)  
- Zod (Schema Validation)  
  
## How to run the project?  
  
The project is quite huge and requires a lot of setup. We are working on making it easier to setup. For now, you can  
follow the steps below to setup the project:  
Notes:  
a. The project is a monorepo (uses TurboRepo) and is split into 3 apps:  
i. Admin (Admin Panel)  
ii. Web (Customer Facing Web-App)  
b. You should have a domain purchased and setup with Cloudflare (as we use Clouflare's R2).  
  
1. Clone the repo  
2. Install the dependencies with (ensure that you have pnpm installed)  
`pnpm install`  
3. Rename the example.config.ts file to config.ts and fill in the details.  
4. Rename the example.env file to .env and fill in the details. We recommend setting up Doppler since it makes it easier  
to manage environment variables across multiple environments.  
5. Sign up on all the websites that the ENV file mentions like Doppler, Clerk.dev, Vercel, Trigger.dev etc. and fill in  
the details.  
6. Setup Trigger.dev and ensure that the endpoint is valid and is specified in the package.json of the _admin_ app.  
7. Finally run the project with `pnpm dev` and verify that everything is working.  
8. You can now deploy the project to Vercel and setup the environment variables on Vercel either manually or setting up  
an integration using Doppler.  
9. Set up your domain on vercel and you are good to go.  
  
### Need some help setting up the project?  
  
We know that the setup this complex can be a bit overwhelming, so we are working on making it easier to setup. If you  
need our help in setting this up, please schedule a call below:  
https://cal.com/imprakharshukla  
  
### Want us to fully-manage your GramFlow instance?  
  
We also offer a fully-managed GramFlow instance where we handle everything from the setup to the maintenance. Please  
reach out to us using the form below to get started:  
  
[Contact Us](https://6h36v1x0q8s.typeform.com/to/bXV3pMAg)