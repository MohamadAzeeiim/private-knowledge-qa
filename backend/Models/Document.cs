using System;
using System.ComponentModel.DataAnnotations;

namespace PrivateKnowledgeQa.Api.Models
{
    public class Document
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
