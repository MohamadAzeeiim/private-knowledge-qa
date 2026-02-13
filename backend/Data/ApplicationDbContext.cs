using Microsoft.EntityFrameworkCore;
using PrivateKnowledgeQa.Api.Models;

namespace PrivateKnowledgeQa.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Document> Documents { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Document>()
                .HasIndex(d => d.CreatedAt);
        }
    }
}
