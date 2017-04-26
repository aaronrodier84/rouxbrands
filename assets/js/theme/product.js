/*
 Import all product specific js
 */
import $ from 'jquery';
import PageManager from './page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import { classifyForm } from './common/form-utils';

export default class Product extends PageManager {
    constructor(context) {
        super(context);
        this.url = location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
        this.$buttonInc = $('[data-action="inc"]');
        this.$buttonDec = $('[data-action="dec"]');
        this.$qtyInput = $('.form-input--incrementTotal');
    }

    before(next) {
        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (this.url.indexOf('#writeReview') !== -1 && typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
        });

        next();
    }

    loaded(next) {
        let validator;

        // Init collapsible
        collapsibleFactory();

        this.productDetails = new ProductDetails($('.productView'), this.context, window.BCData.product_attributes);

        videoGallery();

        const $reviewForm = classifyForm('.writeReview-form');
        const review = new Review($reviewForm);

        $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
            validator = review.registerValidation();
        });

        $reviewForm.on('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });

        var self = this;
        this.$buttonInc.on('click', function(e){
            e.preventDefault();
            var qtyStep = parseInt(self.$qtyInput.attr('data-quantity-min')) == 0 ? 1 : parseInt(self.$qtyInput.attr('data-quantity-min'));
            var oldQty = parseInt(self.$qtyInput.val());
            console.log(oldQty);
            self.$qtyInput.val(oldQty + qtyStep);
            return false;
        });

        this.$buttonDec.on('click', function(e){
            e.preventDefault();
            var qtyStep = parseInt(self.$qtyInput.attr('data-quantity-min')) == 0 ? 1 : parseInt(self.$qtyInput.attr('data-quantity-min'));
            var oldQty = parseInt(self.$qtyInput.val());
            console.log(oldQty);
            if (oldQty > qtyStep){
                self.$qtyInput.val(oldQty - qtyStep);
            }
            return false;
        });

        next();
    }

    after(next) {
        this.productReviewHandler();

        next();
    }

    productReviewHandler() {
        if (this.url.indexOf('#write_review') !== -1) {
            this.$reviewLink.click();
        }
    }
}
