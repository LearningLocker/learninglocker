<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  @section('head')
    <title>
      Learning Locker: an open source learning record store (LRS)
    </title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    {{ HTML::style('bootstrap/css/bootstrap.min.css')}}
    @if(Auth::check())
      {{ HTML::style('css/morris.min.css')}}
      {{ HTML::style('css/extra.css')}}
    @else
      {{ HTML::style('css/walledgarden.css')}}
    @endif
    {{ HTML::style('font-awesome/css/font-awesome.min.css')}}
   
    <!--[if lt IE 9]>
    <script src="{{ URL() }}vendors/html5shiv.js"></script>
    <![endif]-->
  @show
  
</head>
<body>