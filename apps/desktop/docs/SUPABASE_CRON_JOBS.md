# Como Visualizar Cron Jobs no Supabase

Este documento explica como visualizar e monitorar cron jobs criados no Supabase usando a extensão `pg_cron`.

## Visualização Básica

### Ver Todos os Cron Jobs

```sql
SELECT 
    jobid,
    jobname,
    schedule,
    command,
    active,
    nodename,
    nodeport,
    database,
    username
FROM cron.job
ORDER BY jobid;
```

## Histórico de Execuções

### Últimas Execuções

```sql
SELECT 
    jobid,
    runid,
    job_pid,
    database,
    username,
    command,
    status,
    return_message,
    start_time,
    end_time,
    end_time - start_time AS duration
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 50;
```

### Execuções com Detalhes do Job

```sql
SELECT 
    j.jobid,
    j.jobname,
    j.schedule,
    j.command,
    j.active,
    MAX(jrd.start_time) AS last_run,
    COUNT(jrd.runid) AS total_runs,
    COUNT(CASE WHEN jrd.status = 'failed' THEN 1 END) AS failed_runs
FROM cron.job j
LEFT JOIN cron.job_run_details jrd ON j.jobid = jrd.jobid
GROUP BY j.jobid, j.jobname, j.schedule, j.command, j.active
ORDER BY j.jobid;
```

## Monitoramento e Diagnóstico

### Ver Apenas Jobs Ativos

```sql
SELECT * FROM cron.job WHERE active = true;
```

### Ver Falhas Recentes

```sql
SELECT 
    jobid,
    command,
    status,
    return_message,
    start_time,
    end_time
FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC
LIMIT 20;
```

### Ver Jobs com Performance

```sql
SELECT 
    jobid,
    command,
    COUNT(*) AS execution_count,
    AVG(EXTRACT(EPOCH FROM (end_time - start_time))) AS avg_duration_seconds,
    MAX(EXTRACT(EPOCH FROM (end_time - start_time))) AS max_duration_seconds,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) AS failure_count
FROM cron.job_run_details
WHERE start_time > NOW() - INTERVAL '7 days'
GROUP BY jobid, command
ORDER BY avg_duration_seconds DESC;
```

## Tabelas do Sistema

- `cron.job` - Configurações dos cron jobs
- `cron.job_run_details` - Histórico de execuções

## Status Possíveis

- `succeeded` - Execução bem-sucedida
- `failed` - Execução falhou
- `running` - Em execução (se ainda aparecer, pode estar travado)

## Como Usar

1. Acesse o **SQL Editor** no dashboard do Supabase
2. Execute uma das queries acima
3. Para monitorar continuamente, salve as queries como snippets favoritos
