<?php
use DaveJamesMiller\Breadcrumbs;
use Mockery as m;

class ManagerTest extends PHPUnit_Framework_TestCase
{
    public function setUp()
    {
        if (class_exists('Illuminate\View\Factory'))
            $this->factory = m::mock('Illuminate\View\Factory');
        else
            $this->factory = m::mock('Illuminate\View\Environment');

        $this->router = m::mock('Illuminate\Routing\Router');
        $this->manager = new Breadcrumbs\Manager($this->factory, $this->router);

        $this->manager->register('sample', function() {});
    }

    public function testSetView()
    {
        $view = 'my.sample.view';

        $this->manager->setView($view);

        $this->assertSame($view, $this->manager->getView());
    }

    public function testExists()
    {
        $this->assertTrue($this->manager->exists('sample'));
        $this->assertFalse($this->manager->exists('invalid'));

        $this->manager->setCurrentRoute('sample');
        $this->assertTrue($this->manager->exists());

        $this->manager->setCurrentRoute('invalid');
        $this->assertFalse($this->manager->exists());
    }
}
