pipeline {
    agent { label 'deploy-server' }

    environment {
        REGISTRY = "ldnbao145"
        BACKEND_IMAGE  = "${REGISTRY}/onlineauction-backend"
        FRONTEND_IMAGE = "${REGISTRY}/onlineauction-frontend"
        TAG = "v${BUILD_NUMBER}"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }

    stages {

        stage('Checkout') {
            steps {
                git url: 'https://github.com/LeNgocBao145/OnlineAuction.git', branch: 'develop'
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                  docker build -t $BACKEND_IMAGE:$TAG backend                  
                '''
                stage('Build Images') {
            steps {
                // Build backend normally
                sh '''
                  docker build -t $BACKEND_IMAGE:$TAG backend
                '''
                // Build frontend, lấy VITE_API_URL từ file .env.production mà không in ra log
                sh '''
                  # Đọc biến từ file .env.production
                  export $(grep ^VITE_ /opt/onlineauction/frontend/.env.production)
                  
                  # Build frontend với build-arg
                  docker build \
                      --build-arg VITE_API_URL=$VITE_API_URL \
                      --build-arg VITE_OTP_EXPIRE_TIME=$VITE_OTP_EXPIRE_TIME \
                      -t $FRONTEND_IMAGE:$TAG frontend
                '''
            }
        }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                      echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                  docker push $BACKEND_IMAGE:$TAG
                  docker push $FRONTEND_IMAGE:$TAG
                '''
            }
        }

        stage('Deploy with Compose') {
            steps {
                sh '''
                  export TAG=$TAG
                  docker compose pull
                  docker compose up -d
                '''
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f || true'
        }
    }
}
