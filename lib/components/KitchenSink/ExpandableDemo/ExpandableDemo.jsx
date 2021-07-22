import React from 'react'
import { Tabs, Tab } from 'components/Tabs'
import Expandable from 'components/Expandable/Expandable'
import { H2 } from 'components/Heading'


const ExpandableDemo = () => (
  <div className="heading-demo">
    <Tabs>
      <Tab label="Expandables">
        <Expandable header={'This is an expandable'}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales, sapien
          ultricies lobortis ullamcorper, sapien enim gravida augue, nec tincidunt arcu
          lectus at sapien. Pellentesque leo sapien, porta sed consequat ac, eleifend et
          nisl. Nullam enim massa, dignissim nec augue ut, fringilla mattis sapien. Cras
          finibus mi et urna pretium molestie. Sed vehicula, diam sed suscipit dignissim,
          enim quam mattis sem, ullamcorper ultrices erat enim sit amet leo. Interdum et
          malesuada fames ac ante ipsum primis in faucibus. Aliquam a gravida justo. Sed
          vestibulum ultrices velit. Mauris malesuada, nisl quis suscipit tempor, nisi purus
           iaculis elit, quis porta ex tellus eget mi. Nulla facilisi. Nam in eros convallis,
           auctor sem quis, fringilla ante. In sed blandit magna. Vestibulum at imperdiet quam.
           Aliquam a viverra arcu. Donec semper augue velit, a accumsan diam facilisis sit amet.
           Morbi sed dictum tortor, sed sagittis lectus.
          <br />
          Suspendisse eros purus, blandit ultricies consequat eu, consectetur ut ante.
          Fusce viverra nisi vitae pellentesque condimentum. Sed convallis elementum quam,
          at finibus urna gravida vitae. Ut sit amet molestie nulla. Pellentesque volutpat
          varius consequat. Integer id sem porta, porttitor lacus ac, fringilla tortor. Aliquam
          volutpat vehicula tincidunt. Nam ullamcorper, lacus sit amet laoreet sodales, velit
          massa pellentesque magna, quis pharetra neque risus quis libero. Phasellus eleifend
          ac ex ac tempus. Maecenas at tincidunt metus.
          <br />
          Curabitur eu lectus in massa imperdiet imperdiet vitae id eros. Mauris dui nunc,
          venenatis a mauris eu, scelerisque ultricies ante. Aliquam quis posuere est. Vivamus
          ullamcorper, massa nec rutrum elementum, lectus velit dignissim ipsum, nec pellentesque
          diam orci et eros. Aenean tincidunt lacinia sodales. Etiam accumsan magna eu ligula
          suscipit consequat. Phasellus quis fermentum ante. Sed condimentum orci sit amet mi
          cursus, id scelerisque dolor blandit. Quisque porttitor justo ut tristique luctus.
          Praesent accumsan, eros et scelerisque condimentum, dui eros lacinia nisi, at commodo
          orci erat convallis magna. Sed et fringilla magna. Suspendisse potenti. Sed sagittis,
          sapien et suscipit malesuada, odio tellus tempor massa, ac iaculis ex lectus eu metus.
          Nulla suscipit aliquam nisl, aliquam interdum nibh.
        </Expandable>
        <Expandable header={'This is an expandable with initiallyExpanded set to true'} initiallyExpanded>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales, sapien
          ultricies lobortis ullamcorper, sapien enim gravida augue, nec tincidunt arcu
          lectus at sapien. Pellentesque leo sapien, porta sed consequat ac, eleifend et
          nisl. Nullam enim massa, dignissim nec augue ut, fringilla mattis sapien. Cras
          finibus mi et urna pretium molestie. Sed vehicula, diam sed suscipit dignissim,
          enim quam mattis sem, ullamcorper ultrices erat enim sit amet leo. Interdum et
          malesuada fames ac ante ipsum primis in faucibus. Aliquam a gravida justo. Sed
          vestibulum ultrices velit. Mauris malesuada, nisl quis suscipit tempor, nisi purus
           iaculis elit, quis porta ex tellus eget mi. Nulla facilisi. Nam in eros convallis,
           auctor sem quis, fringilla ante. In sed blandit magna. Vestibulum at imperdiet quam.
           Aliquam a viverra arcu. Donec semper augue velit, a accumsan diam facilisis sit amet.
           Morbi sed dictum tortor, sed sagittis lectus.
          <br />
          Suspendisse eros purus, blandit ultricies consequat eu, consectetur ut ante.
          Fusce viverra nisi vitae pellentesque condimentum. Sed convallis elementum quam,
          at finibus urna gravida vitae. Ut sit amet molestie nulla. Pellentesque volutpat
          varius consequat. Integer id sem porta, porttitor lacus ac, fringilla tortor. Aliquam
          volutpat vehicula tincidunt. Nam ullamcorper, lacus sit amet laoreet sodales, velit
          massa pellentesque magna, quis pharetra neque risus quis libero. Phasellus eleifend
          ac ex ac tempus. Maecenas at tincidunt metus.
          <br />
          Curabitur eu lectus in massa imperdiet imperdiet vitae id eros. Mauris dui nunc,
          venenatis a mauris eu, scelerisque ultricies ante. Aliquam quis posuere est. Vivamus
          ullamcorper, massa nec rutrum elementum, lectus velit dignissim ipsum, nec pellentesque
          diam orci et eros. Aenean tincidunt lacinia sodales. Etiam accumsan magna eu ligula
          suscipit consequat. Phasellus quis fermentum ante. Sed condimentum orci sit amet mi
          cursus, id scelerisque dolor blandit. Quisque porttitor justo ut tristique luctus.
          Praesent accumsan, eros et scelerisque condimentum, dui eros lacinia nisi, at commodo
          orci erat convallis magna. Sed et fringilla magna. Suspendisse potenti. Sed sagittis,
          sapien et suscipit malesuada, odio tellus tempor massa, ac iaculis ex lectus eu metus.
          Nulla suscipit aliquam nisl, aliquam interdum nibh.
          Curabitur eu lectus in massa imperdiet imperdiet vitae id eros. Mauris dui nunc,
          venenatis a mauris eu, scelerisque ultricies ante. Aliquam quis posuere est. Vivamus
          ullamcorper, massa nec rutrum elementum, lectus velit dignissim ipsum, nec pellentesque
          diam orci et eros. Aenean tincidunt lacinia sodales. Etiam accumsan magna eu ligula
          suscipit consequat. Phasellus quis fermentum ante. Sed condimentum orci sit amet mi
          cursus, id scelerisque dolor blandit. Quisque porttitor justo ut tristique luctus.
          Praesent accumsan, eros et scelerisque condimentum, dui eros lacinia nisi, at commodo
          orci erat convallis magna. Sed et fringilla magna. Suspendisse potenti. Sed sagittis,
          sapien et suscipit malesuada, odio tellus tempor massa, ac iaculis ex lectus eu metus.
          Nulla suscipit aliquam nisl, aliquam interdum nibh.
        </Expandable>
        <H2>
          Above are two expandables next to each other, but they are all independent.  Below is
          another expandable that is by itself.
        </H2>
        <Expandable header={'Yet another expandable'}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales, sapien
          ultricies lobortis ullamcorper, sapien enim gravida augue, nec tincidunt arcu
          lectus at sapien. Pellentesque leo sapien, porta sed consequat ac, eleifend et
          nisl. Nullam enim massa, dignissim nec augue ut, fringilla mattis sapien. Cras
          finibus mi et urna pretium molestie. Sed vehicula, diam sed suscipit dignissim,
          enim quam mattis sem, ullamcorper ultrices erat enim sit amet leo. Interdum et
          malesuada fames ac ante ipsum primis in faucibus. Aliquam a gravida justo. Sed
          vestibulum ultrices velit. Mauris malesuada, nisl quis suscipit tempor, nisi purus
           iaculis elit, quis porta ex tellus eget mi. Nulla facilisi. Nam in eros convallis,
           auctor sem quis, fringilla ante. In sed blandit magna. Vestibulum at imperdiet quam.
           Aliquam a viverra arcu. Donec semper augue velit, a accumsan diam facilisis sit amet.
           Morbi sed dictum tortor, sed sagittis lectus.
          <br />
          Suspendisse eros purus, blandit ultricies consequat eu, consectetur ut ante.
          Fusce viverra nisi vitae pellentesque condimentum. Sed convallis elementum quam,
          at finibus urna gravida vitae. Ut sit amet molestie nulla. Pellentesque volutpat
          varius consequat. Integer id sem porta, porttitor lacus ac, fringilla tortor. Aliquam
          volutpat vehicula tincidunt. Nam ullamcorper, lacus sit amet laoreet sodales, velit
          massa pellentesque magna, quis pharetra neque risus quis libero. Phasellus eleifend
          ac ex ac tempus. Maecenas at tincidunt metus.
          <br />
          Curabitur eu lectus in massa imperdiet imperdiet vitae id eros. Mauris dui nunc,
          venenatis a mauris eu, scelerisque ultricies ante. Aliquam quis posuere est. Vivamus
          ullamcorper, massa nec rutrum elementum, lectus velit dignissim ipsum, nec pellentesque
          diam orci et eros. Aenean tincidunt lacinia sodales. Etiam accumsan magna eu ligula
          suscipit consequat. Phasellus quis fermentum ante. Sed condimentum orci sit amet mi
          cursus, id scelerisque dolor blandit. Quisque porttitor justo ut tristique luctus.
          Praesent accumsan, eros et scelerisque condimentum, dui eros lacinia nisi, at commodo
          orci erat convallis magna. Sed et fringilla magna. Suspendisse potenti. Sed sagittis,
          sapien et suscipit malesuada, odio tellus tempor massa, ac iaculis ex lectus eu metus.
          Nulla suscipit aliquam nisl, aliquam interdum nibh.
          Suspendisse eros purus, blandit ultricies consequat eu, consectetur ut ante.
          Fusce viverra nisi vitae pellentesque condimentum. Sed convallis elementum quam,
          at finibus urna gravida vitae. Ut sit amet molestie nulla. Pellentesque volutpat
          varius consequat. Integer id sem porta, porttitor lacus ac, fringilla tortor. Aliquam
          volutpat vehicula tincidunt. Nam ullamcorper, lacus sit amet laoreet sodales, velit
          massa pellentesque magna, quis pharetra neque risus quis libero. Phasellus eleifend
          ac ex ac tempus. Maecenas at tincidunt metus.
        </Expandable>
      </Tab>
    </Tabs>
  </div>
)

export default ExpandableDemo
