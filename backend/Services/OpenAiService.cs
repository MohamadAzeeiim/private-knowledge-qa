using System.Text;
using System.Text.Json;
using PrivateKnowledgeQa.Api.DTOs;
using PrivateKnowledgeQa.Api.Repositories;

namespace PrivateKnowledgeQa.Api.Services
{
    public interface IOpenAiService
{
    Task<QuestionResponse> AskQuestionAsync(string question);
    Task<bool> CheckHealthAsync();
}
    public class OpenAiService : IOpenAiService
    {
        private readonly IDocumentRepository _repository;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public OpenAiService(IDocumentRepository repository, IConfiguration configuration)
        {
            _repository = repository;
            _configuration = configuration;
            _httpClient = new HttpClient();
        }

        public async Task<QuestionResponse> AskQuestionAsync(string question)
        {
            var documents = await _repository.GetAllAsync();
            var chunks = BuildChunks(documents.ToList());

            if (!chunks.Any())
                return new QuestionResponse("No documents uploaded yet.", "N/A", "N/A");

            var prompt = new StringBuilder();
            prompt.AppendLine("Answer strictly from provided document chunks. If the answer is not in the chunks, say you don't know and set BOTH Source and Snippet to 'N/A'.");
            prompt.AppendLine("Your response MUST follow this exact format:");
            prompt.AppendLine("ANSWER: [your detailed answer here]");
            prompt.AppendLine("SOURCE: [filename of the document used OR 'N/A']");
            prompt.AppendLine("SNIPPET: [the exact short text snippet OR 'N/A']");
            prompt.AppendLine();
            prompt.AppendLine($"Question: {question}");
            prompt.AppendLine("Document Chunks:");

            foreach (var chunk in chunks)
            {
                prompt.AppendLine($"--- Document: {chunk.FileName} ---");
                prompt.AppendLine(chunk.Text);
            }

            var result = await CallLlmAsync(prompt.ToString());
            return ParseResponse(result);
        }

        public async Task<bool> CheckHealthAsync()
        {
            try
            {
                await CallLlmAsync("ping");
                return true;
            }
            catch
            {
                return false;
            }
        }

        private async Task<string> CallLlmAsync(string prompt)
        {
            var apiKey = _configuration["OpenAI:ApiKey"];
            var model = _configuration["OpenAI:Model"];
            var baseUrl = _configuration["OpenAI:BaseUrl"];

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
_httpClient.DefaultRequestHeaders.Add("HTTP-Referer", "https://private-knowledge-qa-1pbk.onrender.com");
            _httpClient.DefaultRequestHeaders.Add("X-Title", "PrivateKnowledgeQA");

            var requestBody = new
            {
                model = model,
                messages = new[]
                {
                    new { role = "user", content = prompt }
                }
            };

            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.PostAsync(
                $"{baseUrl}/chat/completions",
                content
            );

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            return doc.RootElement
                      .GetProperty("choices")[0]
                      .GetProperty("message")
                      .GetProperty("content")
                      .GetString() ?? "";
        }

        private List<DocumentChunk> BuildChunks(List<Models.Document> documents)
        {
            var chunks = new List<DocumentChunk>();
            foreach (var doc in documents)
            {
                int chunkSize = 800;
                for (int i = 0; i < doc.Content.Length; i += chunkSize)
                {
                    int length = Math.Min(chunkSize, doc.Content.Length - i);
                    chunks.Add(new DocumentChunk
                    {
                        FileName = doc.FileName,
                        Text = doc.Content.Substring(i, length)
                    });
                }
            }
            return chunks;
        }

        private QuestionResponse ParseResponse(string response)
        {
            var answer = ExtractField(response, "ANSWER:");
            var source = ExtractField(response, "SOURCE:");
            var snippet = ExtractField(response, "SNIPPET:");

            // If parsing fails for basic ANSWER, return the whole response as answer
            if (string.IsNullOrWhiteSpace(answer))
            {
                return new QuestionResponse(response, "Unknown", "Not parsed");
            }

            // Sanitize: If the answer suggests no information was found, force N/A for source/snippet
            var lowercaseAnswer = answer.ToLower();
            if (lowercaseAnswer.Contains("don't know") || 
                lowercaseAnswer.Contains("not mentioned") || 
                lowercaseAnswer.Contains("no information"))
            {
                if (source == null || source.ToLower() != "n/a") source = "N/A";
                if (snippet == null || snippet.ToLower() != "n/a") snippet = "N/A";
            }

            return new QuestionResponse(answer, source ?? "Unknown", snippet ?? "Not parsed");
        }

        private string? ExtractField(string text, string fieldName)
        {
            var parts = text.Split(new[] { fieldName }, StringSplitOptions.None);
            if (parts.Length < 2) return null;

            var result = parts[1].Split(new[] { "ANSWER:", "SOURCE:", "SNIPPET:" }, StringSplitOptions.None)[0].Trim();
            return string.IsNullOrWhiteSpace(result) ? null : result;
        }

        private class DocumentChunk
        {
            public string FileName { get; set; } = "";
            public string Text { get; set; } = "";
        }
    }
}
