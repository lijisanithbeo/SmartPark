using Microsoft.EntityFrameworkCore.Storage;
using SmartPark.Domain.Interfaces;

namespace SmartPark.Infrastructure;

public class Transaction : ITransaction
{
    private readonly IDbContextTransaction _inner;

    public Transaction(IDbContextTransaction inner) => _inner = inner;

    public Task CommitAsync()  => _inner.CommitAsync();
    public Task RollbackAsync() => _inner.RollbackAsync();

    public async ValueTask DisposeAsync() => await _inner.DisposeAsync();
}
