# AI Notes

## AI Tools Used
- **Antigravity AI (Google Deepmind)**: Used for architecting the solution, generating boilerplate, implementing business logic, and creating documentation.
- **OpenRouter**: The gateway for accessing various LLM models (currently configured for Llama-3-8B).

## Manually Verified Logic
- **Document Chunking**: Verified that the 800-character chunking logic correctly splits documents and passes them to the prompt.
- **Prompt Construction**: Verified the system instructions to ensure the model stays within the bounds of the provided documents.
- **Repository Pattern**: Verified the separation of data access from business services.
- **Health Checks**: Verified the integration of `HealthCheckService` with custom LLM connectivity checks.

## LLM Choice
- **OpenRouter**: Used as the LLM gateway to access models like Llama-3 or GPT-4o-mini.
- **Llama-3 (or similar)**: The current target model for document-based Q&A.

## Known Limitations
- The parsing of "Source Document" and "Snippet" from the raw model response relies on heuristic string matching. In a production environment, Function Calling or JSON-mode structured outputs would be more robust.
