def gitTag = ''
pipeline {
    agent any
 
    options {
 
        skipDefaultCheckout()
        disableConcurrentBuilds()
        timeout(time: 1, unit: 'HOURS')
    }
    environment {
        HARBOR_URL = 'hub.yunusas.com'
        HARBOR_USER = 'devops'
        HARBOR_PWD = 'Admin@1234!'
        HARBOR_PROJECT_NAME = 'devops'
    }
    tools {
        maven 'maven'
    }
    stages {
        stage('getcode') {
            //agent {
                //docker {
                //    image 'xxxxxxx/middleware/ubuntu1404'
                //    alwaysPull true
                //    reuseNode true
                //}
            //}
                steps {
                    checkout scm
                    echo "Successfully get gitlab code!!"
                }
            }
        stage('npm build') {
			agent{
				docker {
					image 'hub.yunusas.com/devops/nodejs:0.0.3'
					args '-v /data/node_modules:/usr/lib/node_modules'
					args '-v /var/run/docker.sock:/var/run/docker.sock'
					alwaysPull true
					reuseNode true
				}
			}
            
                steps {
                    script {
                        def tag_1 = "$env.gitlabSourceBranch"
                        def tag_2 = tag_1.split("/")
                        def tag_version = tag_2[-1]

                        env.APP_VERSION = tag_version
                        sh 'echo "APP_VERSION=$APP_VERSION" > .env'
                        sh 'npm config set registry https://nexus3.yunupay.com/repository/npm-group/'
                        sh 'npm install'
                        // sh 'build:prod'
                        sh 'npm run build'
                        }
                    }
        }    
            
        stage('Build images and push images to Harbor') {
         
            agent {
                docker {
                    image 'hub.yunusas.com/devops/devops-jenkins-slave:0.0.1'
                    args '-v /var/run/docker.sock:/var/run/docker.sock'
                    //args '-v /usr/bin/docker:/usr/bin/docker'
                    alwaysPull true
                    reuseNode true
                }
            }
            steps{
                script {
                    // 获取提交地址及获取tag版本号
                    gitlab_url = "$env.gitlabSourceRepoHttpUrl"
                    push_type = "$env.gitlabActionType"                   
                    split_url = gitlab_url.split("gitlab.yunupay.com/")
                    split_1 = split_url[-1]
                    split_2 = split_1.split(".git")
                    gitlab_name = split_2[0]
                    tag_1 = "$env.gitlabSourceBranch"
                    tag_2 = tag_1.split("/")
                    tag_version = tag_2[-1]
                    gitTag = tag_version = tag_2[-1]
                    docker_name = gitlab_name.replaceAll("/","-")
                    build_docker_name = "$docker_name"
                    //构建及推送到Harbor仓库
                    sh "docker pull hub.yunusas.com/library/openjdk:8u265-jre-slim"
                    sh "docker login -u admin -p Harbor12345 hub.yunusas.com"
                    sh "docker build --build-arg  TAG=${tag_version} -t hub.yunusas.com/${gitlab_name}/${build_docker_name}:${tag_version} ."

                    //println "hub.yunusas.com/devops/${build_docker_name}:${tag_version} build success!"
                    sh "docker push hub.yunusas.com/${gitlab_name}/${build_docker_name}:${tag_version}"
                    //println "hub.yunusas.com/devops/${build_docker_name}:${tag_version} push success!"
                    // 推送到redmine创建任务
                     //sh "curl \"http://redmine.hub.yunusas.com.com/create_deploy_issue?user_mail=${env.gitlabUserEmail}&project_full_id=${build_docker_name}&project_version=${tag_version}&gitlabSourceRepoHomepage=${env.gitlabSourceRepoHttpUrl}\""
                }
            }
        }
    }
}
