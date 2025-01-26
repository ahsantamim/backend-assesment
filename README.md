## **Getting Started**

**Note for Windows Users**: For better compatibility with Git and Docker, we recommend using [Git Bash](https://git-scm.com/) instead of the default command prompt or PowerShell.

Follow these steps to start the project:

1. **Download the Project**  
   You already have the project downloaded.

2. **Set Up Git**

   - Open your terminal and navigate to the project directory.
   - Initialize Git and make an initial commit:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     ```

3. **Push to Your GitHub**

   - Create a new public repository on **your GitHub account**.
   - Push the project to your GitHub repository.

4. **Create a New Branch**

   - From the `main` branch, create a new branch called `assessment`:
     ```bash
     git checkout -b assessment
     ```

5. **Install Dependencies**

   - Install the necessary packages:
     ```bash
     npm install
     ```

6. **Run the Project**

   - Start the development server:
     ```bash
     docker-compose up --build -d
     docker-compose logs -f app
     ```
   - The project will be available at [http://localhost:3000](http://localhost:3000).

7. **Run the Tests**

   - Start the test containers:
     ```bash
     docker-compose --profile test up -d
     docker-compose --profile test logs -f tests
     ```

8. **Teardown**

   - Remove all the containers, including volumes:
     ```bash
     docker-compose --profile test down
     ```

---

## **Challenge: Implement `/auth/logout` route**

This is a Node.js application with simple authentication routes: `/auth/signup` and `/auth/login`. The `/auth/login` route returns a JWT as `accessToken`. Currently, the implementation is stateless, and there is no mechanism to log out of the application.

Your task is to implement the `/auth/logout` route by leveraging the features of the **Redis** in-memory database.

### 1. **Add Redis Docker Container**

Update the `docker-compose.yml` file to include the necessary configuration for a Redis container.

### 2. **Implement `/auth/logout` Route**

Implement the `/auth/logout` route with the following requirements:

1. An `accessToken` cannot be reused after it has been used to log out of the application.
2. If the user is signed in on multiple browsers or devices, the `accessTokens` for those sessions should remain valid and usable.

**Note**: You may modify the code in other parts of the application if necessary to meet these requirements. However, do not modify the provided tests.

Your implementation will be considered correct if all the tests pass successfully.

---

## **Google Drive Video**

Watch this [Google Drive video](https://drive.google.com/file/d/1TtNhI_DU-oUoPTkJeCql13sNzSzwWM7z/view?usp=sharing) for a full explanation of the challenge and to see a demo of the expected final result.

---

## **Submitting Your Work**

1. **Commit Your Changes**

   - After completing the challenge, commit your changes:
     ```bash
     git add .
     git commit -m "Fix: Implemented challenges"
     ```

2. **Create a Pull Request**

   - Push your changes to **your GitHub repository**:
     ```bash
     git push origin assessment
     ```
   - Create a Pull Request from the `assessment` branch to the `main` branch.

3. **Capture Test Results**

   - Run the tests using Docker:
     ```bash
     docker-compose --profile test up -d
     docker-compose --profile test logs -f tests
     ```
   - Take a screenshot showing that all tests have passed successfully. This screenshot will be required for the submission process.

4. **Prepare Your Submission**

   - Upload the screenshot (showing that all tests have passed successfully) to your **Google Drive**.
   - Compress your completed code (entire project directory with changes without the `node_modules` folder) into a **zipped file**.
   - Upload the zipped file to your **Google Drive**.
   - Ensure the sharing settings allow **anyone with the link** to view the file.

5. **Submit Your Work**

   - Share the following via the provided Google Form:
     - **Pull Request link** (from your GitHub repository).
     - **Screenshot** showing all tests passed.
     - **Google Drive link** to your zipped project.

   Use this **Google Form** to submit: [Submit Your Work](https://docs.google.com/forms/d/e/1FAIpQLSc_PzDYu0VuOmhcOE68kMbUbHZXYzqOHDnT4PZyEGn5sJ6kiw/viewform?usp=sharing).

---

We look forward to reviewing your work!
