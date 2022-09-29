Get-ChildItem '.\output\metadata\*.json' -Recurse | ForEach {
(Get-Content $_ | ForEach { $_ -replace 'nikeimagenes', 'QmYVET1q6KgrmSgzJq7r8zZVoiG5YqiqL2jC8bGAf641Sf' }) |
Set-Content $_
}