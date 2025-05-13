# PostManager

## Cloud Deployment on AWS

This README provides step-by-step instructions to deploy PostManager on AWS infrastructure, following a modern cloud-native architecture. The project consists of a React frontend, a Node.js backend, Amazon S3 for storage, and Amazon DynamoDB for the database, all hosted within a VPC in a selected region.

## Prerequisites

- AWS account with Free Tier access (CAN USE PAID)
- Git installed locally
- Node.js and npm installed
- Docker installed
- AWS CLI configured with appropriate credentials (`aws configure`)
- GitHub account and repository (forked or original)
- Basic knowledge of React, Node.js, and AWS services

## Architecture Overview

- **VPC**: `<your-vpc-name>` in `<your-region>`
- **Frontend**: React app deployed on Elastic Beanstalk (public subnet)
- **Backend**: Node.js app in a Docker container on EC2 (private subnet)
- **Database**: Amazon DynamoDB
- **Storage**: Amazon S3 for file/image uploads
- **Security**: IAM roles, Security Groups, and least-privilege policies

## Step-by-Step Deployment Instructions

### 1. Set Up the GitHub Repository

1. Create or fork a GitHub repository for the project.
2. Clone the repository locally:

   ```bash
   git clone <your-repo-url>
   cd <repo-name>
   ```

   ```bash
   git clone git@github.com:aliabbasnagari/PostManager.git
   cd PostManager
   ```

   We'll have backend and frontend code in the repository.

### 2. Configure the VPC

1. Log in to the AWS Management Console.
2. Navigate to **VPC** > **Create VPC**.
   - Name: `<your-vpc-name>`
   - IPv4 CIDR block: `10.0.0.0/16`
   - Region: `<your-region>`
3. Create subnets:
   - **Public Subnet**: `10.0.1.0/24` (for Elastic Beanstalk)
   - **Private Subnet**: `10.0.2.0/24` (for EC2)
4. Set up an **Internet Gateway** and attach it to the VPC.
5. Create a **Route Table** for the public subnet:
   - Add a route: `0.0.0.0/0` → Internet Gateway.
   - Associate with the public subnet.
6. Ensure the private subnet has a **NAT Gateway** (in the public subnet) for outbound internet access.

### 3. Set Up Security Groups

1. Navigate to **EC2** > **Security Groups** > **Create Security Group**.
2. Create security groups:
   - **Frontend-SG** (Elastic Beanstalk):
     - Inbound: HTTP (port 80) from `0.0.0.0/0`, HTTPS (port 443) from `0.0.0.0/0`
     - Outbound: All traffic
   - **Backend-SG** (EC2):
     - Inbound: HTTP (port 3000) from `Frontend-SG`
     - Outbound: All traffic
   - **DynamoDB-SG** (optional, for VPC endpoint):
     - Inbound: HTTPS (port 443) from `Backend-SG`
     - Outbound: All traffic

### 4. Configure IAM Roles and Policies

1. Navigate to **IAM** > **Roles** > **Create Role**.
2. Create roles:
   - **EC2-Role**:
     - Trusted entity: EC2
     - Attach policies: `AmazonS3FullAccess`, `AmazonDynamoDBFullAccess`
     - Name: `<your-ec2-role-name>`
   - **Beanstalk-Role**:
     - Trusted entity: Elastic Beanstalk
     - Attach policies: `AWSElasticBeanstalkWebTier`, `AmazonS3ReadOnlyAccess`
     - Name: `<your-beanstalk-role-name>`
3. Take screenshots of role creation and policies for submission.

### 5. Set Up Amazon S3

1. Navigate to **S3** > **Create Bucket**.
   - Bucket name: `<your-bucket-name>` (e.g., `ali-huzaifa-12345`)
   - Region: `<your-region>`
   - Disable public access for the bucket.
2. Create a bucket policy for private and public access:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": { "AWS": "<EC2-Role-ARN>" },
         "Action": ["s3:PutObject", "s3:GetObject"],
         "Resource": "arn:aws:s3:::<your-bucket-name>/*"
       },
       {
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::<your-bucket-name>/public/*"
       }
     ]
   }
   ```
3. Enable CORS for the bucket:
   ```xml
   <CORSConfiguration>
     <CORSRule>
       <AllowedOrigin>*</AllowedOrigin>
       <AllowedMethod>GET</AllowedMethod>
       <AllowedMethod>PUT</AllowedMethod>
       <AllowedHeader>*</AllowedHeader>
     </CORSRule>
   </CORSConfiguration>
   ```

### 6. Set Up Amazon DynamoDB

1. Navigate to **DynamoDB** > **Create Table**.
   - Table name: `<your-table-name>`
   - Partition key: `userId` (String)
   - Region: `<your-region>`
2. Create another table for the primary entity (e.g., `ali-huzaifa-posts`):
   - Partition key: `postId` (String)
3. Ensure the `EC2-Role` has permissions to access DynamoDB.

### 7. Deploy the Backend

1. Launch an EC2 instance:

   - AMI: Amazon Linux 2
   - Instance type: `t2.micro`
   - VPC: `<your-vpc-name>`, private subnet
   - Security Group: `Backend-SG`
   - IAM Role: `<your-ec2-role-name>`
   - Enable Docker:
     ```bash
     sudo yum update -y
     sudo amazon-linux-extras install docker
     sudo service docker start
     sudo usermod -a -G docker ec2-user
     ```

2. Upload Backend code to EC2
   Access your EC2 via terminal

   ```bash
   git clone <your-repo-url>
   cd <repo-name>/backend
   ```

3. Build and run the Docker image on EC2:
   ```bash
   docker build -t backend .
   ```
   ```bash
   docker run -d -p 5000:5000 --env-file .env backend
   ```
4. Note the EC2 private IP and backend URL (e.g., `http://<private-ip>:5000`).

### 8. Develop and Deploy the Frontend

1. In the `frontend` directory, create a React app:
   ```bash
   cd frontend
   npx create-react-app .
   npm install axios
   ```
2. Develop the frontend to:
   - Consume the backend REST APIs
   - Handle user authentication
   - Perform CRUD operations
   - Support file/image uploads to S3
3. Build the app:
   ```bash
   npm run build
   ```
4. Deploy to Elastic Beanstalk:
   - Navigate to **Elastic Beanstalk** > **Create Application**.
   - Application name: `<your-frontend-app-name>`
   - Platform: Node.js
   - Upload the `build` folder as a `.zip` file.
   - VPC: `<your-vpc-name>`, public subnet
   - Security Group: `Frontend-SG`
   - IAM Role: `<your-beanstalk-role-name>`
5. Configure environment variables in Elastic Beanstalk:
   - `REACT_APP_API_URL`: Backend URL (e.g., `http://<ec2-private-ip>:5000`)
6. Note the Elastic Beanstalk URL (e.g., `http://<your-frontend-app-name>.<region>.elasticbeanstalk.com`).

### 9. (Optional) Configure Route 53

1. Purchase a domain in **Route 53** or use an existing one.
2. Create a **Hosted Zone** for the domain.
3. Create an **A Record** pointing to the Elastic Beanstalk URL.
4. Update the frontend to use the custom domain.

### 10. Test the Application

1. Access the frontend URL and verify:
   - User authentication works
   - CRUD operations function correctly
   - File/image uploads to S3 succeed
2. Test the backend APIs using tools like Postman.

## Live Demo URLs

- Frontend: `http://post.ap-south-1.elasticbeanstalk.com/`
- Backend: `http://<ec2-private-ip>:3000` (accessible via frontend)
