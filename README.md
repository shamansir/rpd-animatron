# rpd-animatron

Animatron Toolkit for RPD-Framework

See http://github.com/shamansir/rpd for RPD Engine code, detailed information and docs.

This README will also be improved at some point, but for now this repo is just a
submodule for http://github.com/shamansir/rpd.

It can be used as an independent toolkit with compiled RPD engine, of course.

[ [Online playground with Animatron toolkit](http://shamansir.github.io/rpd/examples/anm.html) ].

### Releasing

When you commit some important changes here at last, and want to "release" them,
you should do that:

```
git commit ...
git push origin ...
git tag -af <last-RPD-version> -m "Compatible with <last-RPD-version>"
git push --force origin --tags
``` 

In the root or RPD repository copy, you should do:

```
git fetch origin
git fetch origin --tags
git submodule update --recursive
```
