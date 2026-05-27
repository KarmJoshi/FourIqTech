# Requirements Document

## Introduction

The Dynamic Agent Manager System extends FourIQ Tech's autonomous agency platform to allow the Manager (either the AI Director or a human via the dashboard) to dynamically create, modify, and orchestrate up to 100 AI agents on demand. Instead of a fixed set of department scripts, the Manager can spin up specialized agents (writer, coder, researcher, designer, outreach specialist, etc.) by generating `.mjs` code that follows the existing `agency-core.mjs` architecture. The system enables a self-evolving agency where agents are created, assigned roles, given custom prompts, and orchestrated as a coordinated workforce.

## Glossary

- **Manager**: The top-level orchestrator — either the AI Director agent (`agency-director.mjs`) or a human user operating through the dashboard API
- **Dynamic_Agent**: An AI agent created at runtime by the Manager, stored as a generated `.mjs` script in `.github/scripts/agents/` and registered in the database
- **Agent_Registry**: The database table (`DynamicAgent`) that tracks all created agents, their configurations, status, and metadata
- **Agent_Generator**: The module responsible for producing valid `.mjs` agent code from a role specification provided by the Manager
- **Agent_Template**: A base code template that all generated agents follow, ensuring compatibility with `agency-core.mjs` utilities (smartCall, logActivity, submitToStaging, etc.)
- **Role_Spec**: A structured definition of an agent's purpose, including its name, role, system prompt, model preferences, input/output contract, and department assignment
- **Orchestrator**: The component within the Manager that dispatches work to Dynamic_Agents, monitors their execution, and collects results
- **Agency_Core**: The shared utility module (`agency-core.mjs`) providing AI model calls, staging, logging, and key rotation to all agents
- **Agent_Pool**: The set of all currently active Dynamic_Agents (maximum 100)

## Requirements

### Requirement 1: Agent Creation

**User Story:** As a Manager, I want to create new AI agents by specifying a role and purpose, so that the agency can handle any specialized task without manual coding.

#### Acceptance Criteria

1. WHEN the Manager provides a Role_Spec containing a name, role description, and system prompt, THE Agent_Generator SHALL produce a valid `.mjs` script file in the `.github/scripts/agents/` directory
2. THE Agent_Generator SHALL ensure every generated script imports and uses `agency-core.mjs` utilities (smartCall, logActivity, submitToStaging)
3. WHEN a Dynamic_Agent is created, THE Agent_Registry SHALL store the agent's id, name, role, status, file path, creation timestamp, and configuration
4. THE Agent_Generator SHALL validate that the agent name is unique within the Agent_Registry before creating the script
5. IF the Agent_Pool already contains 100 active agents, THEN THE Agent_Generator SHALL reject the creation request and return an error indicating the pool is full
6. WHEN a Dynamic_Agent script is generated, THE Agent_Generator SHALL verify the script is syntactically valid by performing a dry-run parse before registering it

### Requirement 2: Agent Modification

**User Story:** As a Manager, I want to modify existing agents' prompts, roles, and behavior, so that agents can evolve and improve over time without being recreated from scratch.

#### Acceptance Criteria

1. WHEN the Manager provides an agent ID and updated Role_Spec fields, THE Agent_Registry SHALL update the stored configuration for that agent
2. WHEN an agent's system prompt is modified, THE Agent_Generator SHALL regenerate the agent's `.mjs` script file with the updated prompt
3. THE Agent_Registry SHALL increment a version counter each time an agent is modified
4. WHEN an agent is modified, THE Agent_Registry SHALL record the previous configuration in a modification history array
5. IF the specified agent ID does not exist in the Agent_Registry, THEN THE System SHALL return a not-found error

### Requirement 3: Agent Orchestration and Dispatch

**User Story:** As a Manager, I want to assign tasks to any Dynamic_Agent and run them, so that the agency can execute specialized work through the agents I created.

#### Acceptance Criteria

1. WHEN the Manager dispatches a task to a Dynamic_Agent, THE Orchestrator SHALL spawn the agent's script as a child process with the task parameters passed as arguments
2. WHILE a Dynamic_Agent is executing, THE Orchestrator SHALL track its process ID, start time, and status in the Agent_Registry
3. WHEN a Dynamic_Agent completes execution, THE Orchestrator SHALL update the agent's last-run timestamp and record the exit code in the Agent_Registry
4. IF a Dynamic_Agent exceeds a 10-minute execution timeout, THEN THE Orchestrator SHALL terminate the process and mark the agent's last run as timed-out
5. THE Orchestrator SHALL prevent dispatching a task to an agent that is already running, returning a busy status instead
6. WHEN a Dynamic_Agent produces output, THE Orchestrator SHALL capture stdout and route significant log lines to the ActivityLog

### Requirement 4: Agent Lifecycle Management

**User Story:** As a Manager, I want to activate, deactivate, and delete agents, so that I can manage the Agent_Pool and retire agents that are no longer needed.

#### Acceptance Criteria

1. WHEN the Manager deactivates a Dynamic_Agent, THE Agent_Registry SHALL set the agent's status to "inactive" and THE Orchestrator SHALL refuse to dispatch tasks to that agent
2. WHEN the Manager reactivates a Dynamic_Agent, THE Agent_Registry SHALL set the agent's status to "active" and THE Orchestrator SHALL allow dispatching tasks to that agent
3. WHEN the Manager deletes a Dynamic_Agent, THE System SHALL remove the agent's script file from disk and delete the record from the Agent_Registry
4. THE System SHALL count only agents with status "active" toward the 100-agent pool limit
5. WHEN a Dynamic_Agent is deleted, THE System SHALL preserve the agent's ActivityLog entries for historical reference

### Requirement 5: Agent Discovery and Listing

**User Story:** As a Manager, I want to list all agents with their status, roles, and performance history, so that I can make informed decisions about which agents to use or modify.

#### Acceptance Criteria

1. THE System SHALL expose an API endpoint that returns all registered Dynamic_Agents with their id, name, role, status, creation date, last-run timestamp, and run count
2. WHEN the Manager requests the agent list, THE System SHALL include each agent's current configuration (system prompt summary, model preference, department)
3. THE System SHALL support filtering agents by status (active, inactive) and by department assignment
4. THE System SHALL include each agent's success rate (successful runs divided by total runs) in the listing response

### Requirement 6: API Integration

**User Story:** As a Manager operating through the dashboard, I want REST API endpoints for all agent management operations, so that the dashboard UI can create, modify, dispatch, and monitor agents.

#### Acceptance Criteria

1. THE Agency_API SHALL expose a POST `/api/agents` endpoint that accepts a Role_Spec and creates a new Dynamic_Agent
2. THE Agency_API SHALL expose a PATCH `/api/agents/:id` endpoint that accepts partial Role_Spec updates and modifies the specified agent
3. THE Agency_API SHALL expose a POST `/api/agents/:id/dispatch` endpoint that accepts task parameters and dispatches the agent
4. THE Agency_API SHALL expose a GET `/api/agents` endpoint that returns the full agent listing with optional status and department query filters
5. THE Agency_API SHALL expose a DELETE `/api/agents/:id` endpoint that removes the specified agent
6. THE Agency_API SHALL expose a POST `/api/agents/:id/deactivate` and POST `/api/agents/:id/activate` endpoints for lifecycle control
7. IF any agent API request contains invalid or missing required fields, THEN THE Agency_API SHALL return a 400 status with a descriptive error message

### Requirement 7: Agent Code Generation Quality

**User Story:** As a Manager, I want generated agent code to be production-quality and follow the existing architecture patterns, so that dynamic agents are as reliable as hand-written ones.

#### Acceptance Criteria

1. THE Agent_Generator SHALL produce scripts that follow the existing agent pattern: dotenv import, agency-core imports, Prisma client setup, phased execution with console logging, and proper cleanup (disconnect, pool.end)
2. THE Agent_Generator SHALL include error handling in generated scripts with try/catch around main execution and a fatal error handler
3. THE Agent_Generator SHALL configure each agent's model role in the generated script based on the Role_Spec's model preference field
4. WHEN the Role_Spec specifies that the agent should submit work for review, THE Agent_Generator SHALL include submitToStaging calls in the generated script
5. THE Agent_Generator SHALL include a header comment in each generated script documenting the agent's name, role, creation date, and version

### Requirement 8: Director Integration

**User Story:** As the AI Director, I want to programmatically create and dispatch Dynamic_Agents during my strategic cycle, so that I can spin up specialized agents when the situation demands capabilities beyond the fixed departments.

#### Acceptance Criteria

1. WHEN the Director determines a task requires a capability not covered by existing departments, THE Director SHALL invoke the Agent_Generator to create a specialized Dynamic_Agent
2. THE Director SHALL be able to dispatch Dynamic_Agents alongside fixed department scripts within the same strategic cycle
3. WHEN the Director creates a Dynamic_Agent, THE Director SHALL record the creation decision and reasoning in the JournalEntry
4. THE Director SHALL evaluate Dynamic_Agent performance using the same outcome-tracking system (AgentAction and ActionOutcome) used for fixed departments
