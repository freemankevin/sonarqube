---
title: Azure DevOps Server Integration
url: /analysis/azuredevops-integration/
---
SonarQube's integration with Azure DevOps Server allows you to maintain code quality and security in your Azure DevOps Server repositories.

With this integration, you'll be able to:

- **Import your Azure DevOps repositories** - (starting in [Developer Edition](https://redirect.sonarsource.com/editions/developer.html)) Import your Azure DevOps repositories into SonarQube to easily set up SonarQube projects. 
- **Analyze projects with Azure Pipelines** - SonarScanners running in Azure Pipelines jobs can automatically detect branches or pull requests being built, so you don't need to specifically pass them as parameters to the scanner.
- **Add pull request decoration** - (starting in [Developer Edition](https://redirect.sonarsource.com/editions/developer.html)) See your Quality Gate and code metric results right in Azure DevOps so you know if it's safe to merge your changes.

## Prerequisites
SonarQube integration with Azure DevOps server requires at least Azure DevOps Server 2019, TFS 2018, or TFS 2017 Update 2+.

## Importing your Azure DevOps repositories into SonarQube
Setting up the import of Azure DevOps Server repositories into SonarQube allows you to easily create SonarQube projects from your Azure DevOps Server repositories. This is also the first step in adding pull request decoration. 

To set up the import of Azure DevOps repositories:
1. Set your global settings
1. Add a personal access token for importing repositories

### Setting your global settings
To import your Azure DevOps repositories into SonarQube, you need to first set your global SonarQube settings. Navigate to **Administration > Configuration > General Settings > ALM Integrations**, select the **Azure DevOps** tab, and click the **Create configuration** button. Specify the following settings:
 
- **Configuration Name** (Enterprise and Data Center Edition only) – The name used to identify your Azure DevOps configuration at the project level. Use something succinct and easily recognizable.
- **Azure DevOps server collection URL** – Your full Azure DevOps Server collection URL. For example, `https://ado.your-company.com/DefaultCollection`.
- **Personal Access Token** – An Azure DevOps Server user account is used to decorate Pull Requests. We recommend using a dedicated Azure DevOps Server account with Administrator permissions. You need a [personal access token](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=tfs-2017&tabs=preview-page) from this account with the scope authorized for **Code > Read & Write** for the repositories that will be analyzed. This personal access token is used for pull request decoration. You'll be asked for another personal access token for importing projects

### Adding a personal access token for importing repositories
After setting these global settings, you can add a project from Azure DevOps Server by clicking the "+" in the upper-right corner and selecting **Azure DevOps**:

![import an Azure DevOps Server project](/images/add-ADO-project.png)

Then, you'll be asked to provide a personal access token with `Code (Read & Write)` scope so SonarQube can access and list your Azure DevOps Server projects. This token will be stored in SonarQube and can be revoked at anytime in Azure DevOps Server.

After saving your personal access token, you'll see a list of your Azure DevOps Server projects that you can **set up** to add them to SonarQube. Setting up your projects this way also sets your project settings for pull request decoration. 

For information on analyzing your projects with Azure Pipelines, see the following section.

## Analyzing projects with Azure Pipelines
SonarScanners running in Azure Pipelines jobs can automatically detect branches or pull requests being built, so you don't need to specifically pass them as parameters to the scanner.

You can find a tutorial on setting up analysis with Azure Pipelines by selecting **Azure Pipelines** when asked how you want to analyze your repository:

![Analyzing repositories with Azure Pipelines](/images/AzurePipelinesAnalysis.png)

Or, You can also use the following sections to set up analysis with Azure Pipelines. 

### Installing your extension
From Visual Studio Marketplace, install the [SonarQube extension](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarqube) by clicking the **Get it free** button. If you are using [Microsoft-hosted build agents](https://docs.microsoft.com/en-us/azure/devops/pipelines/agents/hosted?view=azure-devops) then there is nothing else to install. The extension will work with all of the hosted agents (Windows, Linux, and macOS).

If you are self-hosting the build agents, make sure you have at least the minimum SonarQube-supported version of Java installed.

### Adding a new SonarQube Service Endpoint
After installing your extension, you need to declare your SonarQube server as a service endpoint in your Azure DevOps Server project settings:

1. In Azure DevOps Server, go to **Project Settings > Service connections**. 
1. Click **New service connection** and select **SonarQube** from the service connection list.
1. Enter your SonarQube **Server URL**, an [Authentication Token](/user-guide/user-token/), and a memorable **Service connection name**. Then, click **Save**.

### Configuring branch analysis
After adding your SonarQube service endpoint, you'll need to configure branch analysis. You'll use the following tasks in your build definitions to analyze your projects:

- **Prepare Analysis Configuration** - This task configures the required settings before executing the build.

- **Run Code Analysis** - (Not used in Maven or Gradle projects) This task executes the analysis of source code.

- **Publish Quality Gate Result** - this task displays the Quality Gate status in the build summary letting you know if your code meets quality standards for production. This task may increase your build time as your pipeline has to wait for SonarQube to process the analysis report. It is highly recommended but optional.

Select your build technology below to expand the instructions for configuring branch analysis and to see an example `.yml` file.

[[collapse]]
| ## .NET
| 1. In Azure DevOps Server, create or edit a **Build Pipeline**, and add a new **Prepare Analysis Configuration** task _before_ your build task:
|    - Select the SonarQube server endpoint you created in the **Adding a new SonarQube Service Endpoint** section.
|    - Under **Choose a way to run the analysis**, select **Integrate with MSBuild**.
|    - In the **project key** field, enter your project key.
| 1. Add a new **Run Code Analysis** task _after_ your build task.
| 1. Add a new **Publish Quality Gate Result** on your build pipeline summary.
| 1. Under the **Triggers** tab of your pipeline, check **Enable continuous integration**, and select all of the branches for which you want SonarQube analysis to run automatically.
| 1. Save your pipeline.
|
| **.yml example**:
| ```
| trigger:
| - master
| - feature/*
|
| # Prepare Analysis Configuration task
| - task: SonarQubePrepare@4
|   inputs:
|     SonarQube: 'YourSonarqubeServerEndpoint'
|     scannerMode: 'MSBuild'
|     projectKey: 'YourProjectKey'
|
| # Run Code Analysis task
| - task: SonarQubeAnalyze@4
|
| # Publish Quality Gate Result task
| - task: SonarQubePublish@4
|   inputs:
|     pollingTimeoutSec: '300'
| ```

[[collapse]]
| ## Maven or Gradle
| 1. In Azure DevOps Server, create or edit a **Build Pipeline**, and add a new **Prepare Analysis Configuration** task _before_ your build task:
|    - Select the SonarQube server endpoint you created in the **Adding a new SonarQube Service Endpoint** section.
|    - Under **Choose a way to run the analysis**, select **Integrate with Maven or Gradle**.
|    - Expand the **Advanced section** and replace the **Additional Properties** with the following snippet:
| ```
|    # Additional properties that will be passed to the scanner,
|    # Put one key=value per line, example:
|    # sonar.exclusions=**/*.bin
|    sonar.projectKey=YourProjectKey
| ```
| 1. Edit or add a new Maven or Gradle task
|    - Under **Code Analysis**, check **Run SonarQube or SonarCloud Analysis**.
| 1. Add a new **Publish Quality Gate Result** on your build pipeline summary.
| 1. Under the **Triggers** tab of your pipeline, check **Enable continuous integration**, and select all of the branches for which you want SonarQube analysis to run automatically.
| 1. Save your pipeline.
|
| **.yml example**:
| ```
| trigger:
| - master
| - feature/*
|
| # Prepare Analysis Configuration task
| - task: SonarQubePrepare@4
|   inputs:
|     SonarQube: 'YourSonarqubeServerEndpoint'
|     scannerMode: 'Other'
|     extraProperties: 'sonar.projectKey=YourProjectKey'
|
| # Publish Quality Gate Result task
| - task: SonarQubePublish@4
|   inputs:
|     pollingTimeoutSec: '300'
| ```

[[collapse]]
| ## Other (JavaScript, TypeScript, Go, Python, PHP, etc.)
| 1. In Azure DevOps Server, create or edit a **Build Pipeline**, and add a new **Prepare Analysis Configuration** task _before_ your build task:
|    - Select the SonarQube server endpoint you created in the **Adding a new SonarQube Service Endpoint** section.
|    - Under **Choose a way to run the analysis**, select **Integrate with MSBuild**.
|    - Select the **Manually provide configuration** mode.
|    - In the **project key** field, enter your project key.
| 1. Add a new **Run Code Analysis** task _after_ your build task.
| 1. Add a new **Publish Quality Gate Result** on your build pipeline summary.
| 1. Under the **Triggers** tab of your pipeline, check **Enable continuous integration**, and select all of the branches for which you want SonarQube analysis to run automatically.
| 1. Save your pipeline.
|
| **.yml example**:
| ```
| trigger:
| - master
| - feature/*
|
| # Prepare Analysis Configuration task
| - task: SonarQubePrepare@4
|   inputs:
|     SonarQube: 'YourSonarqubeServerEndpoint'
|     scannerMode: 'CLI'
|     configMode: 'manual'
|
| # Run Code Analysis task
| - task: SonarQubeAnalyze@4
|
| # Publish Quality Gate Result task
| - task: SonarQubePublish@4
|   inputs:
|     pollingTimeoutSec: '300'
| ```

[[collapse]]
| ## Analyzing a C/C++/Obj-C project
|In your build pipeline, insert the following steps in the order they appear here. These steps can be interleaved with other steps of your build as long as the following order is followed. All steps have to be executed on the same agent.
| 1. Make **Build Wrapper** available on the build agent:\
|   Download and unzip the **Build Wrapper** on the build agent (see *Prerequisites* section of the [C/C++/Objective-C](/analysis/languages/cfamily/) page). The archive to download and decompress depends on the platform of the host.\
|   Please, note that:
|    - For the Microsoft-hosted build agent you will need to do it every time (as part of build pipeline), e.g. you can add **PowerShell script** task doing that. This can be done by inserting a **Command Line** task.\
|     Example of PowerShell commands on a Windows host:
|     ```
|     Invoke-WebRequest -Uri '<sonarqube_url>/static/cpp/build-wrapper-win-x86.zip' -OutFile 'build-wrapper.zip'
|     Expand-Archive -Path 'build-wrapper.zip' -DestinationPath '.'
|     ```
|     Example of bash commands on a linux host:
|     ```
|     curl '<sonarqube_url>/static/cpp/build-wrapper-linux-x86.zip' --output build-wrapper.zip
|     unzip build-wrapper.zip
|     ```
|     Example of bash commands on a macos host:
|     ```
|     curl '<sonarqube_url>/static/cpp/build-wrapper-macosx-x86.zip' --output build-wrapper.zip
|     unzip build-wrapper.zip
|     ```  
|    - For the self-hosted build agent you can either download it every time (using the same scripts) or only once (as part of manual setup of build agent).
| 2. Add a **Prepare analysis Configuration** task and configure it as follow:\
|   Click on the **Prepare analysis on SonarQube** task to configure it:
|    * Select the **SonarQube Server**
|    * In *Choose the way to run the analysis*, select *standalone scanner* (even if you build with *Visual Studio*/*MSBuild*) 
|    * In *Additional Properties* in the *Advanced* section, add the property `sonar.cfamily.build-wrapper-output` with, as its value, the output directory to which the Build Wrapper should write its results: `sonar.cfamily.build-wrapper-output=<output directory>`
| 3. Add a **Command Line** task to run your build.\
|    For the analysis to happen, your build has to be run through a command line so that it can be wrapped-up by the build-wrapper.
|    To do so, 
|    * Run **Build Wrapper** executable. Pass in as the arguments (1) the output directory configured in the previous task and (2) the command that runs a clean build of your project (not an incremental build).\
|    Example of PowerShell commands on a Windows host with an *MSBuild* build:
|      ```
|     build-wrapper-win-x86/build-wrapper-win-x86-64.exe --out-dir <output directory> MSBuild.exe /t:Rebuild
|      ```
|      Example of bash commands on a linux host with a *make* build:
|      ```
|      build-wrapper-linux-x86/build-wrapper-linux-x86-64 --out-dir <output directory> make clean all
|      ```
|      Example of bash commands on a macos host with a *xcodebuild* build:
|      ```
|      build-wrapper-macosx-x86/build-wrapper-macos-x86 --out-dir <output directory> xcodebuild -project myproject.xcodeproj -configuration Release clean build
|      ```
| 4. Add a **Run Code Analysis** task to run the code analysis and make the results available to SonarQube. Consider running this task right after the previous one as the build environment should not be significantly altered before running the analysis.
| 5. Add a **Publish Quality Gate Result** task.

### Maintaining code quality and security in your pull requests 
Using pull requests allows your to prevent unsafe code or code that doesn't meet your standards from being merged with your main branch. The following branch policies can help you maintain your code quality and safety by analyzing code and identifying issues in all of the pull requests on your project. These policies are optional, but they're highly recommended so you can quickly track, identify, and remediate issues in your code.

#### **Build validation**
Make sure all of your pull requests get automatically analyzed by adding a [build validation branch policy](https://docs.microsoft.com/en-us/azure/devops/pipelines/repos/azure-repos-git#pr-triggers) on the target branch.

#### **Preventing pull request merges when the Quality Gate fails**
Prevent the merge of pull requests with a failed Quality Gate by adding a `SonarQube/quality gate` [status check branch policy](https://docs.microsoft.com/en-us/azure/devops/repos/git/pr-status-policy) on the target branch.

Check out this [YouTube video](https://www.youtube.com/watch?v=be5aw9_7bBU) for a quick overview on preventing pull requests from being merged when they are failing the Quality Gate.

### Running your pipeline
Commit and push your code to trigger the pipeline execution and SonarQube analysis. New pushes on your branches (and pull requests if you set up pull request analysis) trigger a new analysis in SonarQube.

## Adding pull request decoration to Azure DevOps Server
Pull request decoration shows your Quality Gate and analysis metrics directly in Azure DevOps Server.

After you've set up SonarQube to import your Azure DevOps Server repositories as shown in the **Importing your Azure DevOps repositories into SonarQube** above, the simplest way to add pull request decoration is by adding a project from Azure DevOps Server by clicking the "+" in the upper-right corner and selecting **Azure DevOps**.

Then, follow the steps in SonarQube to analyze your project. The project settings for pull request decoration are set automatically.

### Adding pull request decoration to a manually created or existing project
To add pull request decoration to a manually created or existing project, after you've updated your global ALM Integration settings as shown in the **Importing your Azure DevOps repositories into SonarQube** above, set your project settings at **Project Settings > General Settings > Pull Request Decoration**. 

From here, set your: 
- **Project name**
- **Repository name**

### Advanced pull request decoration configuration

[[collapse]]
| ## **Configuring multiple ALM instances**
|You can decorate pull requests from multiple ALM instances by creating a configuration for each ALM instance and then assigning that instance configuration to the appropriate projects. 
|
|- As part of [Developer Edition](https://redirect.sonarsource.com/editions/developer.html), you can create one configuration for each ALM. 
|
|- Starting in [Enterprise Edition](https://redirect.sonarsource.com/editions/enterprise.html), you can create multiple configurations for each ALM. If you have multiple configurations of the same ALM connected to SonarQube, you have to create projects manually.

[[collapse]]
| ## **Linking issues**
| During pull request decoration, individual issues will be linked to their SonarQube counterparts automatically. For this to work correctly, you need to set the instance's **Server base URL** (**[Administration > Configuration > General Settings > General > General](/#sonarqube-admin#/admin/settings/)**) correctly. Otherwise, the links will default to `localhost`.

## FAQ

**Missing Build Agent Capability**	

If you add a Windows Build Agent and install a non-oracle Java version on it, the agent will fail to detect a needed capability for the SonarQube Azure DevOps plugin. If you are sure that the `java` executable is available in the `PATH` environment variable, you can add the missing capability manually by going to **your build agent > capabilities > user capabilities > add capability**. Here, you can add the key, value pair java, and null which should allow the SonarQube plugin to be scheduled on that build agent.	
This Bug has been reported to the Microsoft Team with [azure-pipelines-agent#2046](https://github.com/microsoft/azure-pipelines-agent/issues/2046) but is currently not followed up upon.