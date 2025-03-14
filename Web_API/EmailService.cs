using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public class EmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendConfirmationEmailAsync(string toEmail, string token)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Алма-хроники", _configuration["EmailSettings:SenderEmail"]));
        message.To.Add(new MailboxAddress("", toEmail));
        message.Subject = "Потвърждение на имейл!";

        string confirmationLink = $"{_configuration["AppSettings:FrontendUrl"]}?token={token}";
        message.Body = new TextPart("html")
        {
            Text = $"<p>Натиснете линка отдолу за да потвърдите вашият имейл:</p><a href='{confirmationLink}'>Потвърди имейл</a>"
        };

        using var client = new SmtpClient();
        await client.ConnectAsync(_configuration["EmailSettings:SmtpServer"], int.Parse(_configuration["EmailSettings:SmtpPort"]), true);
        await client.AuthenticateAsync(_configuration["EmailSettings:Username"], _configuration["EmailSettings:Password"]);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}

[Route("api/account")]
[ApiController]
public class AccountController : ControllerBase
{
    private static Dictionary<string, string> _pendingConfirmations = new();
    private readonly EmailService _emailService;

    public AccountController(EmailService emailService)
    {
        _emailService = emailService;
    }

    [HttpPost("register")]
    public async void Register([FromBody] RegisterRequest model)
    {
        string token = Guid.NewGuid().ToString();
        _pendingConfirmations[token] = model.Email;

        await _emailService.SendConfirmationEmailAsync(model.Email, token);
    }

    [HttpGet("confirm-email")]
    public void ConfirmEmail(string token)
    {
        if (_pendingConfirmations.TryGetValue(token, out string email))
        {
            _pendingConfirmations.Remove(token);
        }
    }
}

public class RegisterRequest
{
    public string Email { get; set; }
}
