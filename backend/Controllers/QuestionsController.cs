using Microsoft.AspNetCore.Mvc;
using PrivateKnowledgeQa.Api.DTOs;
using PrivateKnowledgeQa.Api.Services;

namespace PrivateKnowledgeQa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionsController : ControllerBase
    {
        private readonly IOpenAiService _openAiService;

        public QuestionsController(IOpenAiService openAiService)
        {
            _openAiService = openAiService;
        }

        [HttpPost]
        public async Task<IActionResult> AskQuestion([FromBody] QuestionRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Question))
                return BadRequest("Question cannot be empty.");

            var response = await _openAiService.AskQuestionAsync(request.Question);
            return Ok(response);
        }
    }
}
