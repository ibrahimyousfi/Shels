pipeline {
    agent any
    
    environment {
        NODE_VERSION = '20'
        PROJECT_NAME = 'shels'
        VERCEL_ORG_ID = credentials('vercel-org-id')
        VERCEL_PROJECT_ID = credentials('vercel-project-id')
        VERCEL_TOKEN = credentials('vercel-token')
        GEMINI_API_KEY = credentials('gemini-api-key')
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from repository...'
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'
                sh '''
                    node --version
                    npm --version
                    npm ci
                '''
            }
        }
        
        stage('Lint') {
            steps {
                echo 'Running ESLint...'
                sh 'npm run lint || true'
            }
            post {
                always {
                    publishHTML([
                        reportDir: '.',
                        reportFiles: 'eslint-report.html',
                        reportName: 'ESLint Report',
                        allowMissing: true
                    ])
                }
            }
        }
        
        stage('Type Check') {
            steps {
                echo 'Running TypeScript type check...'
                sh 'npx tsc --noEmit'
            }
        }
        
        stage('Build') {
            steps {
                echo 'Building Next.js application...'
                sh '''
                    npm run build
                '''
            }
            post {
                success {
                    echo 'Build successful!'
                    archiveArtifacts artifacts: '**.next/**', fingerprint: true
                }
                failure {
                    echo 'Build failed!'
                }
            }
        }
        
        stage('Test') {
            steps {
                echo 'Running tests...'
                script {
                    // Add your test commands here
                    // sh 'npm test' // Uncomment when tests are added
                    echo 'Tests will be added in future iterations'
                }
            }
        }
        
        stage('Deploy to Vercel') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                echo 'Deploying to Vercel...'
                script {
                    sh '''
                        # Install Vercel CLI
                        npm install -g vercel@latest
                        
                        # Deploy to Vercel
                        vercel --prod --token=${VERCEL_TOKEN} --yes
                    '''
                }
            }
            post {
                success {
                    echo 'Deployment to Vercel successful!'
                    // You can add Slack/Email notifications here
                }
                failure {
                    echo 'Deployment to Vercel failed!'
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline execution completed'
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded! ✅'
        }
        failure {
            echo 'Pipeline failed! ❌'
        }
    }
}
