import * as path from 'path';

import * as cdk from "aws-cdk-lib"; 
import * as iam from "aws-cdk-lib/aws-iam";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";



interface computeStackProps extends cdk.StackProps {
    usersTable: Table; 
    todosTable: Table; 
}

export class ComputeStack extends cdk.Stack {
    public readonly addUserToTableFunc: NodejsFunction;
    
    // AppSync Resolvers
    public readonly createTodoFunc : NodejsFunction;

    constructor(scope: Construct, id: string, props: computeStackProps) {
        super(scope, id, props);

        this.addUserToTableFunc = this.addUserToUsersTable(props)
        this.createTodoFunc = this.createTodoFunction(props)
    }

    addUserToUsersTable(props: computeStackProps) {
        const func = new NodejsFunction(this, "addUserFunc", {
            functionName: "addUserFunc",
            runtime: Runtime.NODEJS_20_X,
            handler: "handler",
            entry: path.join(__dirname, "../functions/AddUserPostConfirmation/index.ts")
        });

        func.addToRolePolicy(new iam.PolicyStatement({
            actions: ["dynamodb:PutItem"],
            resources: [props.usersTable.tableArn as string]
        }))

        return func
    }

    createTodoFunction(props: computeStackProps) {
        const func = new NodejsFunction(this, "createTodoFunc", {
            functionName: "createTodoFunc",
            runtime: Runtime.NODEJS_20_X,
            handler: "handler",
            entry: path.join(__dirname, "../AppSyncFunctions/createTodo/index.ts")
        });

        func.addToRolePolicy(new iam.PolicyStatement({
            actions: ["dynamodb:PutItem"],
            resources: [props.todosTable.tableArn as string]
        }))

        return func;
    }
}