using System;

namespace PrivateKnowledgeQa.Api.DTOs
{
    public record DocumentDto(Guid Id, string FileName, DateTime CreatedAt);
    
    public record QuestionRequest(string Question);
    
    public record QuestionResponse(string Answer, string SourceDocument, string SourceSnippet);
}
