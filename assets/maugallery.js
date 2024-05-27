(function ($) {
  $.fn.mauGallery = function (options) {
    options = $.extend($.fn.mauGallery.defaults, options);
    let tagsCollection = [];
    const gallery = this;

    gallery.each(function () {
      const $this = $(this);

      $.fn.mauGallery.methods.createRowWrapper($this);

      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox($this, options.lightboxId, options.navigation);
      }

      $.fn.mauGallery.listeners(options);

      const galleryItems = $this.children(".gallery-item");

      galleryItems.each(function () {
        const $item = $(this);
        $.fn.mauGallery.methods.responsiveImageItem($item);
        $.fn.mauGallery.methods.moveItemInRowWrapper($item);
        $.fn.mauGallery.methods.wrapItemInColumn($item, options.columns);

        const theTag = $item.data("gallery-tag");
        if (options.showTags && theTag !== undefined && !tagsCollection.includes(theTag)) {
          tagsCollection.push(theTag);
        }
      });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags($this, options.tagsPosition, tagsCollection);
      }

      $this.fadeIn(500);
    });

    return this;
  };


  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  $.fn.mauGallery.listeners = function (options) {
    $(".gallery").on("click", ".gallery-item", function () {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      }
    });

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };

  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (!element.children().first().hasClass("row")) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },

    wrapItemInColumn(element, columns) {
      if (typeof columns === "number") {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (typeof columns === "object") {
        let columnClasses = "";
        if (columns.xs) columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        if (columns.sm) columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        if (columns.md) columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        if (columns.lg) columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        if (columns.xl) columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
      }
    },

    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },

    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },

    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },

    prevImage(lightboxId) {
      const activeImage = $(".lightboxImage").attr("src");
      let imagesCollection = [];
      let activeTag = $(".tags-bar .active-tag").data("images-toggle");

      if (activeTag === "all") {
        imagesCollection = $("img.gallery-item");
      } else {
        imagesCollection = $(`img.gallery-item[data-gallery-tag="${activeTag}"]`);
      }

      const index = imagesCollection.toArray().findIndex(img => $(img).attr("src") === activeImage);
      const prevIndex = (index - 1 + imagesCollection.length) % imagesCollection.length;
      const prevImage = imagesCollection.eq(prevIndex).attr("src");

      $(".lightboxImage").attr("src", prevImage);
    },

     nextImage(lightboxId) {
      const activeImage = $(".lightboxImage").attr("src");
      let imagesCollection = [];
      let activeTag = $(".tags-bar .active-tag").data("images-toggle");

      if (activeTag === "all") {
        imagesCollection = $("img.gallery-item");
      } else {
        imagesCollection = $(`img.gallery-item[data-gallery-tag="${activeTag}"]`);
      }

      const index = imagesCollection.toArray().findIndex(img => $(img).attr("src") === activeImage);
      const nextIndex = (index + 1) % imagesCollection.length;
      const nextImage = imagesCollection.eq(nextIndex).attr("src");

      $(".lightboxImage").attr("src", nextImage);
    },

    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${
                              navigation
                                ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
    },
    showItemTags(gallery, position, tags) {
      let tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
        tags.forEach(value => {
        tagItems += `<li class="nav-item">
                <span class="nav-link" style="cursor:pointer;" data-images-toggle="${value}">${value}</span></li>`;
      });
      const tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },
    filterByTag() {
      if ($(this).hasClass("active-tag")) return;

      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active active-tag");

      const tag = $(this).data("images-toggle");

      $(".gallery-item").each(function () {
        const $this = $(this);
        const $parent = $this.parents(".item-column");
        $parent.hide();
        if (tag === "all" || $this.data("gallery-tag") === tag) {
          $parent.show(300);
        }
      });
    }
  };
})(jQuery);
