using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using PrivateKnowledgeQa.Api.Services;

namespace PrivateKnowledgeQa.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatusController : ControllerBase
    {
        private readonly HealthCheckService _healthCheckService;
        private readonly IOpenAiService _openAiService;

        public StatusController(HealthCheckService healthCheckService, IOpenAiService openAiService)
        {
            _healthCheckService = healthCheckService;
            _openAiService = openAiService;
        }

        [HttpGet]
        public async Task<IActionResult> GetStatus()
        {
            var report = await _healthCheckService.CheckHealthAsync();
            var openAiHealthy = await _openAiService.CheckHealthAsync();

            var status = new
            {
                Backend = "Healthy",
                Database = report.Status == HealthStatus.Healthy ? "Healthy" : "Unhealthy",
                Llm = openAiHealthy ? "Healthy" : "Unhealthy"
            };

            return Ok(status);
        }
    }
}
