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

        stage('Generate frontend env') {
        steps {
            withCredentials([
                string(credentialsId: 'VITE_API_URL', variable: 'VITE_API_URL'),
                string(credentialsId: 'VITE_OTP_EXPIRE_TIME', variable: 'VITE_OTP_EXPIRE_TIME'),
                string(credentialsId: 'VITE_RECAPTCHA_SITE_KEY', variable: 'VITE_RECAPTCHA_SITE_KEY'),
                string(credentialsId: 'VITE_TINYMCE_API_KEY', variable: 'VITE_TINYMCE_API_KEY')
            ]) {
                sh '''
                  cat <<EOF > frontend/.env.production
                  VITE_API_URL=$VITE_API_URL
                  VITE_OTP_EXPIRE_TIME=$VITE_OTP_EXPIRE_TIME
                  VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY
                  VITE_TINYMCE_API_KEY=$VITE_TINYMCE_API_KEY
                  EOF
                '''
                }
            }
        }


        stage('Build Images') {            
            steps {
                // Build backend normally
                sh '''
                  docker build -t $BACKEND_IMAGE:$TAG backend
                '''
                // Build frontend
                sh '''                  
                  docker build -t $FRONTEND_IMAGE:$TAG frontend
                '''
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
