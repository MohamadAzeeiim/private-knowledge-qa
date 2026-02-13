using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PrivateKnowledgeQa.Api.DTOs;
using PrivateKnowledgeQa.Api.Models;
using PrivateKnowledgeQa.Api.Repositories;

namespace PrivateKnowledgeQa.Api.Services
{
    public interface IDocumentService
    {
        Task<IEnumerable<DocumentDto>> GetDocumentsAsync();
        Task<DocumentDto> UploadDocumentAsync(string fileName, string content);
        Task DeleteDocumentAsync(Guid id);
    }

    public class DocumentService : IDocumentService
    {
        private readonly IDocumentRepository _repository;

        public DocumentService(IDocumentRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<DocumentDto>> GetDocumentsAsync()
        {
            var docs = await _repository.GetAllAsync();
            return docs.Select(d => new DocumentDto(d.Id, d.FileName, d.CreatedAt));
        }

        public async Task<DocumentDto> UploadDocumentAsync(string fileName, string content)
        {
            var doc = new Document
            {
                Id = Guid.NewGuid(),
                FileName = fileName,
                Content = content,
                CreatedAt = DateTime.UtcNow
            };

            var savedDoc = await _repository.AddAsync(doc);
            return new DocumentDto(savedDoc.Id, savedDoc.FileName, savedDoc.CreatedAt);
        }

        public async Task DeleteDocumentAsync(Guid id)
        {
            await _repository.DeleteAsync(id);
        }
    }
}
